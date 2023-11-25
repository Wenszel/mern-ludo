const { getRoom, updateRoom, getJoinableRoom, createNewRoom, findPlayer } = require('../controllers/roomController');
const { colors } = require('../utils/constants');

module.exports = socket => {
    const req = socket.request;

    const handleLogin = async data => {
        if (await findPlayer(req.sessionID)) return;
        const room = await getJoinableRoom();
        if (room) {
            addPlayerToExistingRoom(room, data);
        } else {
            addNewRoom(data);
        }
    };

    const handleReady = async () => {
        const room = await getRoom(req.session.roomId);
        room.getPlayer(req.session.playerId).changeReadyStatus();
        if (room.canStartGame()) {
            room.startGame();
        }
        await updateRoom(room);
    };

    const addNewRoom = async data => {
        const room = createNewRoom();
        room.addPlayer(data.name, req.sessionID);
        await room.save();
        reloadSession(room);
    };

    const addPlayerToExistingRoom = async (room, data) => {
        room.addPlayer(data.name);
        if (room.isFull()) {
            room.startGame();
        }
        await updateRoom(room);
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
