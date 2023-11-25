const socketManager = require('../socket/socketManager');
const registerPlayerHandlers = require('../handlers/playerHandler');
const registerRoomHandlers = require('../handlers/roomHandler');
const registerGameHandlers = require('../handlers/gameHandler');
const { sessionMiddleware, wrap } = require('../config/session');

module.exports = function (server) {
    socketManager.initialize(server);
    socketManager.getIO().engine.on('initial_headers', (headers, req) => {
        if (req.cookieHolder) {
            headers['set-cookie'] = req.cookieHolder;
            delete req.cookieHolder;
        }
    });
    socketManager.getIO().use(wrap(sessionMiddleware));
    socketManager.getIO().on('connection', socket => {
        registerPlayerHandlers(socket);
        registerRoomHandlers(socket);
        registerGameHandlers(socket);
        if (socket.request.session.roomId) {
            const roomId = socket.request.session.roomId.toString();
            socket.join(roomId);
            socket.emit('player:data', JSON.stringify(socket.request.session));
        }
    });
};
