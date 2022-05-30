const RoomModel = require('../schemas/room');
const { colors } = require('../utils/constants');
const { getStartPositions } = require('../utils/functions');

module.exports = (io, socket) => {
    const req = socket.request;
    const login = data => {
        // When new player login to game we are looking for not full and not started room to put player there
        RoomModel.findOne({ full: false, started: false }, function (err, room) {
            if (room) {
                // If there is one adds player to it
                addPlayerToExistingRoom(room, data);
            } else {
                // If not creates new room and add player to it
                createNewRoom(data);
            }
        });
    };

    socket.on('player:login', login);

    function createNewRoom(data) {
        const room = new RoomModel({
            createDate: new Date(),
            players: [
                {
                    name: data.name,
                    color: colors[0],
                },
            ],
            pawns: getStartPositions(),
        });
        // Saves new room to database
        room.save().then(() => {
            // Since it is not bound to an HTTP request, the session must be manually reloaded and saved
            req.session.reload(err => {
                if (err) return socket.disconnect();
                // Saving session data
                req.session.roomId = room._id;
                req.session.playerId = room.players[0]._id;
                req.session.color = room.players[0].color;
                req.session.save();
                // Sending data to the user, after which player will be redirected to the game
                socket.emit('player:data', JSON.stringify(req.session));
            });
        });
    }

    function addPlayerToExistingRoom(room, data) {
        // Adding a new user to the room
        room.players.push({
            name: data.name,
            ready: false,
            color: colors[room.players.length],
        });
        let updatedRoom = { players: room.players };
        // Checking if the room is full
        if (room.players.length === 4) {
            // Changes the properties of the room to the state to start the game
            updatedRoom = {
                ...updatedRoom,
                full: true,
                started: true,
                nextMoveTime: Date.now() + 15000,
                pawns: getStartPositions(),
            };
            updatedRoom.players.forEach(player => (player.ready = true));
            updatedRoom.players[0].nowMoving = true;
        }
        // Updates a room in the database
        RoomModel.findOneAndUpdate({ _id: room._id }, updatedRoom).then(() => {
            // Since it is not bound to an HTTP request, the session must be manually reloaded and saved
            req.session.reload(err => {
                if (err) return socket.disconnect();
                // Saving session data
                req.session.roomId = room._id;
                req.session.playerId = updatedRoom.players[updatedRoom.players.length - 1]._id;
                req.session.color = colors[updatedRoom.players.length - 1];
                req.session.save();
                // Sending data to the user, after which player will be redirected to the game
                socket.emit('player:data', JSON.stringify(req.session));
            });
        });
    }
};
