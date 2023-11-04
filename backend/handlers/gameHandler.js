const RoomModel = require('../schemas/room');
const { getPawnPositionAfterMove } = require('../utils/functions');

module.exports = (io, socket) => {
    const req = socket.request;

    const getRoom = async () => {
        return await RoomModel.findOne({ _id: req.session.roomId }).exec();
    };

    const updateRoom = async room => {
        return await RoomModel.findOneAndUpdate({ _id: req.session.roomId }, room).exec();
    };

    const sendToPlayersRolledNumber = rolledNumber => {
        io.to(req.session.roomId.toString()).emit('game:roll', rolledNumber);
    };

    const sendToPlayersData = room => {
        io.to(req.session.roomId.toString()).emit('room:data', JSON.stringify(room));
    };

    const rollDice = async () => {
        const rolledNumber = Math.ceil(Math.random() * 6);
        sendToPlayersRolledNumber(rolledNumber);
        let room = await updateRoom({ rolledNumber: rolledNumber });
        if (!canPlayerMove(room, rolledNumber)) {
            room = changeMovingPlayer(room);
            await updateRoom(room);
            sendToPlayersData(room);
        }
    };

    const canPlayerMove = (room, rolledNumber) => {
        let isMovePossible = false;
        const playerPawns = room.pawns.filter(pawn => pawn.color === req.session.color);
        for (const pawn of playerPawns) {
            // (if player's pawn is in base) if the rolled number is 1,6
            if (pawn.position === pawn.basePos && (rolledNumber === 6 || rolledNumber === 1)) {
                isMovePossible = true;
            }
            // (if player's pawn is near finish line) if the move does not go beyond the win line
            if (pawn.position !== getPawnPositionAfterMove(rolledNumber, pawn) && pawn.position !== pawn.basePos) {
                isMovePossible = true;
            }
        }
        return isMovePossible;
    };

    const isMoveValid = async (pawn, room) => {
        if (req.session.color !== pawn.color) {
            return false;
        }
        currentlyMovingPlayer = room.players.filter(player => player.nowMoving === true);
        if (req.session.playerId !== currentlyMovingPlayer._id) {
            return false;
        }
        return true;
    };

    const skipPlayerTurn = async () => {
        let room = await getRoom();
        room = changeMovingPlayer(room);
        await updateRoom(room);
        sendToPlayersData(room);
    };

    const movePawn = async ({ pawnId }) => {
        let room = await getRoom();
        const indexOfPawn = room.pawns.findIndex(pawn => pawn._id == pawnId);
        if (!isMoveValid(room.pawns[indexOfPawn], room)) return;
        const newPositionOfMovedPawn = getPawnPositionAfterMove(room.rolledNumber, room.pawns[indexOfPawn]);
        room.pawns[indexOfPawn].position = newPositionOfMovedPawn;
        room = beatPawns(newPositionOfMovedPawn, room);
        room = changeMovingPlayer(room);
        await updateRoom(room);
        sendToPlayersData(room);
    };

    const beatPawns = (position, room) => {
        const pawnsInTheSamePosition = room.pawns.filter(pawn => pawn.position === position);
        pawnsInTheSamePosition.forEach(pawn => {
            if (pawn.color !== req.session.color) {
                const index = room.pawns.findIndex(i => i._id === pawn._id);
                room.pawns[index].position = room.pawns[index].basePos;
            }
        });
        return room;
    };

    const changeMovingPlayer = room => {
        if (room.timeoutID) clearTimeout(room.timeoutID);
        const playerIndex = room.players.findIndex(player => player.nowMoving === true);
        room.players[playerIndex].nowMoving = false;
        if (playerIndex + 1 === room.players.length) {
            room.players[0].nowMoving = true;
        } else {
            room.players[playerIndex + 1].nowMoving = true;
        }
        room.nextMoveTime = Date.now() + 15000;
        room.rolledNumber = null;
        room.timeoutID = setTimeout(skipPlayerTurn, 15000);
        return room;
    };

    socket.on('game:roll', rollDice);
    socket.on('game:move', movePawn);
    socket.on('game:skip', skipPlayerTurn);
};
