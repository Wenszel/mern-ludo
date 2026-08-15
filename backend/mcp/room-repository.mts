import mongoose from 'mongoose';

export const ROOM_CAPACITY = 4;
export const DEFAULT_ROOM_LIMIT = 25;
export const MAX_ROOM_LIMIT = 100;

const PLAYER_COLORS = ['red', 'blue', 'green', 'yellow'] as const;

export type RoomStatus = 'waiting' | 'full' | 'in_progress' | 'finished';
export type RoomListStatus = 'available' | RoomStatus | 'all';
export type RoomPrivacy = 'public' | 'private' | 'any';
export type RoomSort = 'oldest' | 'newest' | 'most_players' | 'fewest_players';

interface PlayerDocument {
    name?: string;
    color?: string;
    ready?: boolean;
    nowMoving?: boolean;
}

interface PawnDocument {
    _id?: mongoose.Types.ObjectId;
    color?: string;
    basePos?: number;
    position?: number;
}

export interface RoomDocument {
    _id: mongoose.Types.ObjectId | { toString(): string };
    name?: string;
    private?: boolean;
    password?: string;
    createDate?: Date;
    started?: boolean;
    full?: boolean;
    nextMoveTime?: number;
    rolledNumber?: number;
    players?: PlayerDocument[];
    playerCount?: number;
    winner?: string | null;
    pawns?: PawnDocument[];
}

export interface RoomSummary {
    id: string;
    name: string | null;
    isPrivate: boolean;
    status: RoomStatus;
    playerCount: number;
    capacity: number;
    createdAt: string | null;
}

export interface ListRoomsOptions {
    status?: RoomListStatus;
    privacy?: RoomPrivacy;
    minPlayers?: number;
    maxPlayers?: number;
    sort?: RoomSort;
    limit?: number;
    createdAfter?: Date;
}

export interface CreateRoomInput {
    name: string;
    isPrivate?: boolean;
    password?: string;
}

export interface RoomDetails extends RoomSummary {
    winner: string | null;
    rolledNumber: number | null;
    nextMoveAt: string | null;
    currentTurn: RoomPlayer | null;
    players: RoomPlayer[];
    pawns?: RoomPawn[];
}

export interface RoomPlayer {
    name: string | null;
    color: string | null;
    ready: boolean;
    isCurrentTurn: boolean;
}

export interface RoomPawn {
    color: string | null;
    basePosition: number | null;
    position: number | null;
}

interface RoomCursor {
    toArray(): Promise<RoomDocument[]>;
}

export interface RoomsCollection {
    aggregate(pipeline: Record<string, unknown>[]): RoomCursor;
    findOne(filter: Record<string, unknown>, options: Record<string, unknown>): Promise<RoomDocument | null>;
    insertOne(room: RoomDocument): Promise<unknown>;
}

let connectionPromise: Promise<typeof mongoose> | undefined;

export async function connectToDatabase(): Promise<void> {
    if (mongoose.connection.readyState === 1) return;

    const connectionUri = process.env.CONNECTION_URI;
    if (!connectionUri) throw new Error('CONNECTION_URI is required to query rooms.');

    if (!connectionPromise) {
        connectionPromise = mongoose
            .connect(connectionUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                dbName: process.env.MONGODB_DB_NAME || 'test',
            })
            .catch((error: unknown) => {
                connectionPromise = undefined;
                throw error;
            });
    }

    await connectionPromise;
}

async function roomsCollection(collection?: RoomsCollection): Promise<RoomsCollection> {
    if (collection) return collection;
    await connectToDatabase();
    return mongoose.connection.collection('rooms') as unknown as RoomsCollection;
}

function playerCount(room: RoomDocument): number {
    if (Number.isInteger(room.playerCount)) return room.playerCount as number;
    return Array.isArray(room.players) ? room.players.length : 0;
}

export function roomStatus(room: RoomDocument): RoomStatus {
    if (room.winner) return 'finished';
    if (room.started === true) return 'in_progress';
    if (room.full === true || playerCount(room) >= ROOM_CAPACITY) return 'full';
    return 'waiting';
}

export function isRoomAvailable(room: RoomDocument): boolean {
    return roomStatus(room) === 'waiting';
}

export function summarizeRoom(room: RoomDocument): RoomSummary {
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

function roomFilter({
    status = 'available',
    privacy = 'any',
    minPlayers,
    maxPlayers,
    createdAfter,
}: ListRoomsOptions = {}): Record<string, unknown> {
    const conditions: Record<string, unknown>[] = [];

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
    if (conditions.length === 1) return conditions[0]!;
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

function roomSort(sort?: RoomSort): Record<string, 1 | -1> {
    if (sort === 'newest') return { createDate: -1, _id: -1 };
    if (sort === 'most_players') return { playerCount: -1, createDate: 1 };
    if (sort === 'fewest_players') return { playerCount: 1, createDate: 1 };
    return { createDate: 1, _id: 1 };
}

export async function listRooms(options: ListRoomsOptions = {}, collection?: RoomsCollection): Promise<RoomSummary[]> {
    const rooms = await roomsCollection(collection);
    const documents = await rooms
        .aggregate([
            { $match: roomFilter(options) },
            { $project: SUMMARY_PROJECTION },
            { $sort: roomSort(options.sort) },
            { $limit: options.limit ?? DEFAULT_ROOM_LIMIT },
        ])
        .toArray();

    return documents.map(summarizeRoom);
}

export async function checkAvailableRooms(collection?: RoomsCollection): Promise<{
    checkedAt: string;
    count: number;
    rooms: RoomSummary[];
}> {
    const rooms = await listRooms({ status: 'available', limit: MAX_ROOM_LIMIT }, collection);
    return { checkedAt: new Date().toISOString(), count: rooms.length, rooms };
}

function createInitialPawns(): PawnDocument[] {
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

export async function createRoom(input: CreateRoomInput, collection?: RoomsCollection): Promise<RoomSummary> {
    const rooms = await roomsCollection(collection);
    const isPrivate = input.isPrivate ?? false;
    const room: RoomDocument = {
        _id: new mongoose.Types.ObjectId(),
        name: input.name.trim(),
        private: isPrivate,
        createDate: new Date(),
        started: false,
        full: false,
        players: [],
        winner: null,
        pawns: createInitialPawns(),
    };
    if (isPrivate) room.password = input.password;

    await rooms.insertOne(room);
    return summarizeRoom(room);
}

export async function getRoomDetails(
    roomId: string,
    { includePawns = false }: { includePawns?: boolean } = {},
    collection?: RoomsCollection
): Promise<RoomDetails | null> {
    const rooms = await roomsCollection(collection);
    const projection: Record<string, 1> = {
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

    const players: RoomPlayer[] = (room.players || []).map(player => ({
        name: player.name || null,
        color: player.color || null,
        ready: Boolean(player.ready),
        isCurrentTurn: Boolean(player.nowMoving),
    }));
    const details: RoomDetails = {
        ...summarizeRoom(room),
        winner: room.winner || null,
        rolledNumber: Number.isInteger(room.rolledNumber) ? (room.rolledNumber as number) : null,
        nextMoveAt: Number.isFinite(room.nextMoveTime) ? new Date(room.nextMoveTime as number).toISOString() : null,
        currentTurn: players.find(player => player.isCurrentTurn) || null,
        players,
    };

    if (includePawns) {
        details.pawns = (room.pawns || []).map(pawn => ({
            color: pawn.color || null,
            basePosition: Number.isInteger(pawn.basePos) ? (pawn.basePos as number) : null,
            position: Number.isInteger(pawn.position) ? (pawn.position as number) : null,
        }));
    }

    return details;
}

export async function getLobbySummary(collection?: RoomsCollection): Promise<{
    checkedAt: string;
    totalRooms: number;
    availableRooms: number;
    publicAvailableRooms: number;
    privateAvailableRooms: number;
    statusCounts: Record<RoomStatus, number>;
    occupancy: { players: number; capacity: number; percent: number };
    dataQuality: { overCapacity: number; fullFlagMismatch: number };
}> {
    const rooms = await roomsCollection(collection);
    const documents = await rooms.aggregate([{ $project: SUMMARY_PROJECTION }]).toArray();
    const statusCounts: Record<RoomStatus, number> = { waiting: 0, full: 0, in_progress: 0, finished: 0 };
    let availableRooms = 0;
    let publicAvailableRooms = 0;
    let privateAvailableRooms = 0;
    let totalPlayers = 0;
    let overCapacity = 0;
    let fullFlagMismatch = 0;

    for (const room of documents) {
        const count = playerCount(room);
        statusCounts[roomStatus(room)] += 1;
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
        statusCounts,
        occupancy: {
            players: totalPlayers,
            capacity,
            percent: capacity === 0 ? 0 : Math.round((totalPlayers / capacity) * 1000) / 10,
        },
        dataQuality: { overCapacity, fullFlagMismatch },
    };
}
