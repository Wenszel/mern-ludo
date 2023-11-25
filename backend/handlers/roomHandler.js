const { getRooms, getRoom, updateRoom } = require('../controllers/roomController');
const { sendToOnePlayerRooms, sendToOnePlayerData, sendToPlayersData } = require('../socket/emits');

module.exports = socket => {
    const req = socket.request;

    const getData = async () => {
        const room = await getRoom(req.session.roomId);
        // Handle the situation when the server crashes and any player reconnects after the time has expired
        // Typically, the responsibility for changing players is managed by gameHandler.js.
        if (room.nextMoveTime <= Date.now()) {
            room.changeMovingPlayer();
            await updateRoom(room);
        }
        sendToOnePlayerData(socket.id, room);
    };

    const getAllRooms = async () => {
        let rooms = await getRooms();
        const response = [];
        rooms.forEach(room => {
            if (!room.isStarted && !room.isFull()) {
                response.push({
                    _id: room._id,
                    private: room.private,
                    name: room.name,
                    players: room.players,
                    isStarted: room.isStarted,
                });
            }
        });
        sendToOnePlayerRooms(socket.id, response);
    };

    socket.on('room:data', getData);
    socket.on('room:rooms', getAllRooms);
};
