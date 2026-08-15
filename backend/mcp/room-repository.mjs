import mongoose from 'mongoose';

export const ROOM_CAPACITY = 4;
export const DEFAULT_ROOM_LIMIT = 25;
export const MAX_ROOM_LIMIT = 100;
const PLAYER_COLORS = ['red', 'blue', 'green', 'yellow'];

let connectionPromise;

export async function connectToDatabase() {
    if (mongoose.connection.readyState === 1) return;

    const connectionUri = process.env.CONNECTION_URI;
    if (!connectionUri) {
        throw new Error('CONNECTION_URI is required to query rooms.');
    }

    if (!connectionPromise) {
        connectionPromise = mongoose
            .connect(connectionUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                dbName: process.env.MONGODB_DB_NAME || 'test',
            })
            .catch(error => {
                connectionPromise = undefined;
                throw error;
            });
    }

    await connectionPromise;
}

async function roomsCollection(collection) {
    if (collection) return collection;
    await connectToDatabase();
    return mongoose.connection.collection('rooms');
}

function playerCount(room) {
    if (Number.isInteger(room.playerCount)) return room.playerCount;
    return Array.isArray(room.players) ? room.players.length : 0;
}

export function roomStatus(room) {
    if (room.winner) return 'finished';
    if (room.started === true) return 'in_progress';
    if (room.full === true || playerCount(room) >= ROOM_CAPACITY) return 'full';
    return 'waiting';
}

export function isRoomAvailable(room) {
    return roomStatus(room) === 'waiting';
}

export function summarizeRoom(room) {
    return {
        id: room._id.toString(),
        name: room.name || null,
        isPrivate: Boolean(room.private),
        status: roomStatus(room),
        playerCount: playerCount(room),
        capacity: ROOM_CAPACITY,
        createdAt: room.createDate instanceof Date ? room.createDate.toISOString() : null,
    };
}

function roomFilter({ status = 'available', privacy = 'any', minPlayers, maxPlayers, createdAfter } = {}) {
    const conditions = [];

    if (status === 'available') {
        conditions.push({ started: { $ne: true }, winner: null, full: { $ne: true }, 'players.3': { $exists: false } });
    } else if (status === 'waiting') {
        conditions.push({ started: { $ne: true }, winner: null });
    } else if (status === 'in_progress') {
        conditions.push({ started: true, winner: null });
    } else if (status === 'full') {
        conditions.push({
            started: { $ne: true },
            winner: null,
            $or: [{ full: true }, { 'players.3': { $exists: true } }],
        });
    } else if (status === 'finished') {
        conditions.push({ winner: { $type: 'string', $ne: '' } });
    }

    if (privacy === 'public') conditions.push({ private: { $ne: true } });
    if (privacy === 'private') conditions.push({ private: true });
    if (createdAfter) conditions.push({ createDate: { $gt: createdAfter } });

    if (minPlayers !== undefined || maxPlayers !== undefined) {
        const size = { $size: { $ifNull: ['$players', []] } };
        if (minPlayers !== undefined) conditions.push({ $expr: { $gte: [size, minPlayers] } });
        if (maxPlayers !== undefined) conditions.push({ $expr: { $lte: [size, maxPlayers] } });
    }

    if (conditions.length === 0) return {};
    if (conditions.length === 1) return conditions[0];
    return { $and: conditions };
}

const SUMMARY_PROJECTION = {
    _id: 1,
    name: 1,
    private: 1,
    createDate: 1,
    playerCount: { $size: { $ifNull: ['$players', []] } },
    started: 1,
    full: 1,
    winner: 1,
};

function roomSort(sort) {
    if (sort === 'newest') return { createDate: -1, _id: -1 };
    if (sort === 'most_players') return { playerCount: -1, createDate: 1 };
    if (sort === 'fewest_players') return { playerCount: 1, createDate: 1 };
    return { createDate: 1, _id: 1 };
}

export async function listRooms(options = {}, collection) {
    const rooms = await roomsCollection(collection);
    const limit = options.limit ?? DEFAULT_ROOM_LIMIT;
    const mongoSort = roomSort(options.sort);
    const documents = await rooms
        .aggregate([
            { $match: roomFilter(options) },
            { $project: SUMMARY_PROJECTION },
            { $sort: mongoSort },
            { $limit: limit },
        ])
        .toArray();

    return documents.map(summarizeRoom);
}

export async function checkAvailableRooms(collection) {
    const rooms = await listRooms({ status: 'available', limit: MAX_ROOM_LIMIT }, collection);
    return { checkedAt: new Date().toISOString(), count: rooms.length, rooms };
}

function createInitialPawns() {
    return PLAYER_COLORS.flatMap((color, colorIndex) =>
        Array.from({ length: 4 }, (_, pawnIndex) => {
            const basePosition = colorIndex * 4 + pawnIndex;
            return {
                _id: new mongoose.Types.ObjectId(),
                color,
                basePos: basePosition,
                position: basePosition,
            };
        })
    );
}

export async function createRoom({ name, isPrivate = false, password }, collection) {
    const rooms = await roomsCollection(collection);
    const room = {
        _id: new mongoose.Types.ObjectId(),
        name: name.trim(),
        private: isPrivate,
        createDate: new Date(),
        started: false,
        full: false,
        players: [],
        winner: null,
        pawns: createInitialPawns(),
    };
    if (isPrivate) room.password = password;

    await rooms.insertOne(room);
    return summarizeRoom(room);
}

export async function getRoomDetails(roomId, { includePawns = false } = {}, collection) {
    const rooms = await roomsCollection(collection);
    const projection = {
        _id: 1,
        name: 1,
        private: 1,
        createDate: 1,
        started: 1,
        full: 1,
        winner: 1,
        'players.name': 1,
        'players.color': 1,
        'players.ready': 1,
        'players.nowMoving': 1,
        rolledNumber: 1,
        nextMoveTime: 1,
    };
    if (includePawns) {
        projection['pawns.color'] = 1;
        projection['pawns.basePos'] = 1;
        projection['pawns.position'] = 1;
    }

    const room = await rooms.findOne({ _id: new mongoose.Types.ObjectId(roomId) }, { projection });
    if (!room) return null;

    const players = (room.players || []).map(player => ({
        name: player.name || null,
        color: player.color || null,
        ready: Boolean(player.ready),
        isCurrentTurn: Boolean(player.nowMoving),
    }));
    const currentTurn = players.find(player => player.isCurrentTurn) || null;
    const details = {
        ...summarizeRoom(room),
        winner: room.winner || null,
        rolledNumber: Number.isInteger(room.rolledNumber) ? room.rolledNumber : null,
        nextMoveAt: Number.isFinite(room.nextMoveTime) ? new Date(room.nextMoveTime).toISOString() : null,
        currentTurn,
        players,
    };

    if (includePawns) {
        details.pawns = (room.pawns || []).map(pawn => ({
            color: pawn.color || null,
            basePosition: Number.isInteger(pawn.basePos) ? pawn.basePos : null,
            position: Number.isInteger(pawn.position) ? pawn.position : null,
        }));
    }

    return details;
}

export async function getLobbySummary(collection) {
    const rooms = await roomsCollection(collection);
    const documents = await rooms.aggregate([{ $project: SUMMARY_PROJECTION }]).toArray();
    const counts = { waiting: 0, full: 0, in_progress: 0, finished: 0 };
    let availableRooms = 0;
    let publicAvailableRooms = 0;
    let privateAvailableRooms = 0;
    let totalPlayers = 0;
    let overCapacity = 0;
    let fullFlagMismatch = 0;

    for (const room of documents) {
        const count = playerCount(room);
        const status = roomStatus(room);
        counts[status] += 1;
        totalPlayers += count;
        if (count > ROOM_CAPACITY) overCapacity += 1;
        if (Boolean(room.full) !== (count >= ROOM_CAPACITY)) fullFlagMismatch += 1;
        if (isRoomAvailable(room)) {
            availableRooms += 1;
            if (room.private) privateAvailableRooms += 1;
            else publicAvailableRooms += 1;
        }
    }

    const capacity = documents.length * ROOM_CAPACITY;
    return {
        checkedAt: new Date().toISOString(),
        totalRooms: documents.length,
        availableRooms,
        publicAvailableRooms,
        privateAvailableRooms,
        statusCounts: counts,
        occupancy: {
            players: totalPlayers,
            capacity,
            percent: capacity === 0 ? 0 : Math.round((totalPlayers / capacity) * 1000) / 10,
        },
        dataQuality: { overCapacity, fullFlagMismatch },
    };
}
