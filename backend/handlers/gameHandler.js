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
    const roll = () => {
        const rolledNumber = Math.ceil(Math.random() * 6);
        req.session.reload(err => {
            if (err) return socket.disconnect();
            // Saving session data
            req.session.rolledNumber = rolledNumber;
            req.session.save();
            socket.emit('game:roll', rolledNumber);
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
                io.to(req.session.roomId.toString()).emit('room:data', JSON.stringify(updatedRoom));
                socket.emit('room:move');
            });
        });
    };

    socket.on('game:roll', roll);
    socket.on('game:move', move);
};
