const Room = require('../schemas/room');
const { getPawnPositionAfterMove } = require('../utils/functions');

module.exports = (io, socket) => {
    const req = socket.request;

    const handleMovePawn = async pawnId => {
        const room = await getRoom();
        const pawn = room.getPawn(pawnId);
        if (isMoveValid(pawn, room)) {
            const newPositionOfMovedPawn = getPawnPositionAfterMove(room.rolledNumber, pawn);
            room.changePositionOfPawn(pawn, newPositionOfMovedPawn);
            room.beatPawns(newPositionOfMovedPawn, req.session.color);
            handleChangeOfPlayer(room);
        }
    };

    const handleRollDice = async () => {
        const rolledNumber = rollDice();
        const room = await updateRoom({ rolledNumber: rolledNumber });
        if (!canPlayerMove(room, rolledNumber)) {
            handleChangeOfPlayer(room);
        }
    };

    const rollDice = () => {
        const rolledNumber = Math.ceil(Math.random() * 6);
        sendToPlayersRolledNumber(rolledNumber);
        return rolledNumber;
    };

    const canPlayerMove = (room, rolledNumber) => {
        const playerPawns = room.getPlayerPawns(req.session.color);
        for (const pawn of playerPawns) {
            if (pawn.canMove(rolledNumber)) return true;
        }
        return false;
    };

    const isMoveValid = (pawn, room) => {
        if (req.session.color !== pawn.color) {
            return false;
        }
        if (req.session.playerId !== room.getCurrentlyMovingPlayer()._id.toString()) {
            return false;
        }
        return true;
    };

    const handleChangeOfPlayer = async room => {
        room.changeMovingPlayer();
        room.timeoutID = setTimeout(makeRandomMove, 15000, room);
        await updateRoom(room);
    };

    const makeRandomMove = async room => {
        if (room.rolledNumber === null) room.rolledNumber = rollDice();
        const pawnsThatCanMove = room.getPawnsThatCanMove()
        if (pawnsThatCanMove.length > 0) {
            const randomPawn = pawnsThatCanMove[Math.floor(Math.random() * pawnsThatCanMove.length)];
            room.movePawn(randomPawn);
        }
        await handleChangeOfPlayer(room);
    };

    Room.watch().on('change', async () => {
        sendToPlayersData(await getRoom());
    });

    const getRoom = async () => {
        return await Room.findOne({ _id: req.session.roomId }).exec();
    };

    const updateRoom = async room => {
        return await Room.findOneAndUpdate({ _id: req.session.roomId }, room).exec();
    };

    const sendToPlayersRolledNumber = rolledNumber => {
        io.to(req.session.roomId).emit('game:roll', rolledNumber);
    };

    const sendToPlayersData = room => {
        io.to(req.session.roomId).emit('room:data', JSON.stringify(room));
    };

    socket.on('game:roll', handleRollDice);
    socket.on('game:move', handleMovePawn);
};
