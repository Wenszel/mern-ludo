const RoomModel = require('../schemas/room');
const { getPawnPositionAfterMove } = require('../utils/functions');

module.exports = (io, socket) => {
    const req = socket.request;
    /*
    Function responsible for drawing number in range from 1 to 6 and returning it to the player
    if current player can move with drawed number allow the player to make a move
    else skip player's turn 
    */
    const rollDiceNumber = async () => {
        const rolledNumber = Math.ceil(Math.random() * 6);
        let room = await RoomModel.findOne({ _id: req.session.roomId }).exec();
        room.rolledNumber = rolledNumber;
        await RoomModel.findOneAndUpdate({ _id: req.session.roomId }, room).exec();
        io.to(req.session.roomId.toString()).emit('game:roll', rolledNumber);
        const isPossible = await canPlayerMoveAnyPawn(req.session.roomId, req.session.color, rolledNumber);
        if (!isPossible) {
            room = changeMovingPlayer(room);
            await RoomModel.findOneAndUpdate({ _id: req.session.roomId }, room).exec();
            io.to(req.session.roomId.toString()).emit('room:data', JSON.stringify(room));
        }
    };
    /* 
    Function responsible for check if any pawn of the player can move
    if he cannot move, his turn will be skipped
    Player's pawn can move if:
        1) (if player's pawn is in base) if the rolled number is 1,6
        2) (if player's pawn is near finish line) if the move does not go beyond the win line
    Returns boolean
    */
    const canPlayerMoveAnyPawn = async (roomId, playerColor, rolledNumber) => {
        let isMovePossible = false;
        const room = await RoomModel.findOne({ _id: roomId.toString() }).exec();
        const playerPawns = room.pawns.filter(pawn => pawn.color === playerColor);
        // Checking each player's pawn
        for (const pawn of playerPawns) {
            // Checking the first condition
            if (pawn.position === pawn.basePos && (rolledNumber === 6 || rolledNumber === 1)) {
                isMovePossible = true;
            }
            // Checking the second condition
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
    /*
    Function responsible for skipping a player's turn, if he did not move within the allotted time
    Function is used in timeouts that start after a player's move or after skipping his turn
    */
    const skipPlayerTurn = async () => {
        let room = await RoomModel.findOne({ _id: req.session.roomId }).exec();
        room = changeMovingPlayer(room);
        await RoomModel.findOneAndUpdate({ _id: req.session.roomId }, room).exec();
        io.to(req.session.roomId.toString()).emit('room:data', JSON.stringify(room));
    };
    /*
    Function responsible for moving the pawn by the number of spots that have been drawn
    Props: pawnId - Id which is needed to find a pawn in the board. Id is the only thing that distinguishes pawns of the same color.
    */
    const movePawn = async ({ pawnId }) => {
        let room = await RoomModel.findOne({ _id: req.session.roomId }).exec();
        const indexOfMovedPawn = room.pawns.findIndex(pawn => pawn._id == pawnId);
        const newPositionOfMovedPawn = getPawnPositionAfterMove(room.rolledNumber, room.pawns[indexOfMovedPawn]);
        if (!isMoveValid(room.pawns[indexOfMovedPawn], room)) return;
        room.pawns[indexOfMovedPawn].position = newPositionOfMovedPawn;
        // Looking for pawns in the same position as the new position of the pawn
        const pawnsInTheSamePosition = room.pawns.filter(pawn => pawn.position === newPositionOfMovedPawn);
        // Each pawn in this position is checked to see if it has the same color as the pawn that has now moved to this position, if so, it is moved to the base (captured)
        pawnsInTheSamePosition.forEach(pawn => {
            if (pawn.color !== req.session.color) {
                const index = room.pawns.findIndex(i => i._id === pawn._id);
                room.pawns[index].position = room.pawns[index].basePos;
            }
        });
        room = changeMovingPlayer(room);
        await RoomModel.findOneAndUpdate({ _id: req.session.roomId }, room).exec();
        io.to(req.session.roomId.toString()).emit('room:data', JSON.stringify(room));
    };
    /*
    Function responsible for changing the currently moving player in room object. 
    It changes the value of nowMoving for both players and sets a new turn-end time and erases the currently drawn number.
    The function is used as an auxiliary function in other functions because many of them perform the operation of changing the currently moving player.
    Args: room (object) from mongoDB
    Returns: room object after changes
    */
    const changeMovingPlayer = room => {
        const playerIndex = room.players.findIndex(player => player.nowMoving === true);
        room.players[playerIndex].nowMoving = false;
        if (playerIndex + 1 === room.players.length) {
            room.players[0].nowMoving = true;
        } else {
            room.players[playerIndex + 1].nowMoving = true;
        }
        room.nextMoveTime = Date.now() + 15000;
        room.rolledNumber = null;
        setTimeout(skipPlayerTurn, 15000);
        return room;
    };

    socket.on('game:roll', rollDiceNumber);
    socket.on('game:move', movePawn);
    socket.on('game:skip', skipPlayerTurn);
};
