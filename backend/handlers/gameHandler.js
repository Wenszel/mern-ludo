const RoomModel = require('../schemas/room');
const { getPositionAfterMove } = require('../utils/functions');
/* 
    Function handle all requests
    file constains functions:
    1. roll
    2. move
*/
module.exports = (io, socket) => {
    const req = socket.request;
    const roll = async () => {
        const rolledNumber = Math.ceil(Math.random() * 6);
        req.session.reload(async err => {
            if (err) return socket.disconnect();
            // Saving session data
            req.session.rolledNumber = rolledNumber;
            req.session.save();
            io.to(req.session.roomId.toString()).emit('game:roll', rolledNumber);
            const isPossible = await isMovePossible(req.session.roomId, req.session.color, rolledNumber);
            if (!isPossible) {
                RoomModel.findOne({ _id: req.session.roomId }, (err, room) => {
                    // Updating moving player
                    const playerIndex = room.players.findIndex(player => player.nowMoving === true);
                    const roomSize = room.players.length;
                    room.players[playerIndex].nowMoving = false;
                    if (playerIndex + 1 === roomSize) {
                        room.players[0].nowMoving = true;
                    } else {
                        room.players[playerIndex + 1].nowMoving = true;
                    }
                    // Updating timer
                    room.nextMoveTime = Date.now() + 15000;
                    // Pushing above data to database
                    RoomModel.findOneAndUpdate({ _id: req.session.roomId }, room, err => {
                        if (err) return err;
                        io.to(req.session.roomId.toString()).emit('room:data', JSON.stringify(room));
                        io.to(req.session.roomId.toString()).emit('game:skip');
                    });
                });
            }
        });
    };
    /* 
    Function responsible for check if any pawn of the player can move
    if he cannot move, his turn will be skipped
    Player's pawn can move if:
        1) (if player's pawn is in base) if the rolled number is 1,6
        2) (if player's pawn is near finish line) if the move does not go beyond the win line
    */
    const isMovePossible = async (roomId, playerColor, rolledNumber) => {
        let isMovePossible = false;
        await RoomModel.findOne({ _id: roomId.toString() }, (err, room) => {
            const playerPawns = room.pawns.filter(pawn => pawn.color === playerColor);
            // Checking each player's pawn
            for (const pawn of playerPawns) {
                // Checking the first condition
                if (pawn.position === pawn.basePos && (rolledNumber === 6 || rolledNumber === 1)) {
                    isMovePossible = true;
                }
                // Checking the second condition
                if (pawn.position !== getPositionAfterMove(rolledNumber, pawn) && pawn.position !== pawn.basePos) {
                    isMovePossible = true;
                }
            }
        });
        return isMovePossible;
    };

    const skip = async () => {
        await RoomModel.findOne({ _id: req.session.roomId }, (err, room) => {
            if (room.nextMoveTime >= Date.now()) return err;
            // Updating moving player
            const playerIndex = room.players.findIndex(player => player.nowMoving === true);
            const roomSize = room.players.length;
            room.players[playerIndex].nowMoving = false;
            if (playerIndex + 1 === roomSize) {
                room.players[0].nowMoving = true;
            } else {
                room.players[playerIndex + 1].nowMoving = true;
            }
            // Updating timer
            room.nextMoveTime = Date.now() + 15000;
            // Pushing above data to database
            RoomModel.findOneAndUpdate({ _id: req.session.roomId }, room, err => {
                if (err) return err;
                io.to(req.session.roomId.toString()).emit('room:data', JSON.stringify(room));
                io.to(req.session.roomId.toString()).emit('game:skip');
            });
        });
    };
    const move = ({ pawnId }) => {
        RoomModel.findOne({ _id: req.session.roomId }, function (err, room) {
            if (!room) return err;
            const pawnIndex = room.pawns.findIndex(pawn => pawn._id == pawnId);
            room.pawns[pawnIndex].position = getPositionAfterMove(req.session.rolledNumber, room.pawns[pawnIndex]);
            const pawnsOnPos = room.pawns.filter(pawn => pawn.position == room.pawns[pawnIndex].position);
            pawnsOnPos.forEach(pawn => {
                if (pawn.color !== req.session.color) {
                    const index = room.pawns.findIndex(i => i._id === pawn._id);
                    room.pawns[index].position = room.pawns[index].basePos;
                }
            });
            // Updating moving player
            const playerIndex = room.players.findIndex(player => player.nowMoving === true);
            const roomSize = room.players.length;
            room.players[playerIndex].nowMoving = false;
            if (playerIndex + 1 === roomSize) {
                room.players[0].nowMoving = true;
            } else {
                room.players[playerIndex + 1].nowMoving = true;
            }
            // Updating timer
            room.nextMoveTime = Date.now() + 15000;
            // Pushing above data to database
            RoomModel.findOneAndUpdate({ _id: req.session.roomId }, room, (err, updatedRoom) => {
                if (!updatedRoom) return err;
                io.to(req.session.roomId.toString()).emit('room:data', JSON.stringify(room));
                io.to(req.session.roomId.toString()).emit('game:move');
            });
        });
    };

    socket.on('game:roll', roll);
    socket.on('game:move', move);
    socket.on('game:skip', skip);
};
