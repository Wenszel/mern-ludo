const RoomModel = require('../schemas/room');

module.exports = (io, socket) => {
    const req = socket.request;
    const getData = () => {
        RoomModel.findOne({ _id: req.session.roomId }, function (err, room) {
            if (!room) return err;
            if (room.nextMoveTime <= Date.now()) {
                changeCurrentMovingPlayer();
            } else {
                io.to(req.session.roomId).emit('room:data', JSON.stringify(room));
            }
        });
    };

    socket.on('room:data', getData);

    function changeCurrentMovingPlayer() {
        RoomModel.findOne({ _id: req.session.roomId }, function (err, room) {
            if (!room) return err;
            const index = room.players.findIndex(player => player.nowMoving === true);
            const roomSize = room.players.length;
            room.players[index].nowMoving = false;
            if (index + 1 === roomSize) {
                room.players[0].nowMoving = true;
            } else {
                room.players[index + 1].nowMoving = true;
            }
            room.nextMoveTime = Date.now() + 15000;
            RoomModel.findOneAndUpdate({ _id: req.session.roomId }, room, function (err, updatedRoom) {
                io.to(req.session.roomId).emit('room:data', JSON.stringify(updatedRoom));
            });
        });
    }
};
