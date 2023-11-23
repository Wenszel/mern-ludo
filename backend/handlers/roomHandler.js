const RoomModel = require('../schemas/room');

module.exports = (io, socket) => {
    const req = socket.request;

    const getData = async () => {
        let room = await RoomModel.findOne({ _id: req.session.roomId });
        // Handle the situation when the server crashes and any player reconnects after the time has expired
        // Typically, the responsibility for changing players is managed by gameHandler.js.
        if (room.nextMoveTime <= Date.now()) {
            room.changeMovingPlayer();
            await RoomModel.findOneAndUpdate({ _id: req.session.roomId }, room);
            io.to(req.session.roomId).emit('room:data', JSON.stringify(room));
        } else {
            io.to(socket.id).emit('room:data', JSON.stringify(room));
        }
    };

    const getRooms = async () => {
        let rooms = await RoomModel.find({});
        const response = [];
        rooms.forEach(room => {
            if (!room.isStarted && !room.isFull()) {
                response.push({
                    _id: room._id,
                    name: room.name,
                    players: room.players,
                    isStarted: room.isStarted,
                });
            }
        });
        io.to(socket.id).emit('room:rooms', JSON.stringify(response));
    };

    

    socket.on('room:data', getData);
    socket.on('room:rooms', getRooms);
};
