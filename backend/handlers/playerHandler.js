const RoomModel = require('../schemas/room');
const { colors } = require('../utils/constants');

module.exports = (io, socket) => {
    const req = socket.request;

    const handleLogin = async data => {
        const room = await RoomModel.findOne({ full: false, started: false });
        if (room) {
            addPlayerToExistingRoom(room, data);
        } else {
            createNewRoom(data);
        }
    };

    const handleReady = async () => {
        const { roomId, playerId } = req.session;
        const room = await RoomModel.findOne({ _id: roomId });
        room.getPlayer(playerId).changeReadyStatus();
        if (room.canStartGame()) {
            room.startGame();
        }
        await RoomModel.findOneAndUpdate({ _id: roomId }, room);
        io.to(roomId).emit('room:data', JSON.stringify(room));
    };

    const createNewRoom = async data => {
        const room = new RoomModel();
        room.addPlayer(data.name);
        await room.save();
        reloadSession(room);
    };

    const addPlayerToExistingRoom = async (room, data) => {
        room.addPlayer(data.name);
        if (room.isFull()) {
            room.startGame();
        }
        await RoomModel.findOneAndUpdate({ _id: room._id }, room);
        reloadSession(room);
    };

    // Since it is not bound to an HTTP request, the session must be manually reloaded and saved
    const reloadSession = room => {
        req.session.reload(err => {
            if (err) return socket.disconnect();
            req.session.roomId = room._id.toString();
            req.session.playerId = room.players[room.players.length - 1]._id.toString();
            req.session.color = colors[room.players.length - 1];
            req.session.save();
            socket.join(room._id.toString());
            socket.emit('player:data', JSON.stringify(req.session));
        });
    };

    socket.on('player:login', handleLogin);
    socket.on('player:ready', handleReady);
};
