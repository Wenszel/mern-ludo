const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { sessionMiddleware, wrap } = require('./controllers/serverController');
const registerPlayerHandlers = require('./handlers/playerHandler');
const PORT = 8080;
const mongoose = require('mongoose');
const CONNECTION_URI = require('./credentials.js');
const app = express();

app.use(cookieParser());
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(express.json());
app.set('trust proxy', 1);
app.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true,
    })
);
app.use(sessionMiddleware);

mongoose.set('useFindAndModify', false);
mongoose
    .connect(CONNECTION_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('MongoDB Connected…');
    })
    .catch(err => console.error(err));

const server = app.listen(PORT, () => {
    console.log('Server runs on port ' + PORT);
});

const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000',
        credentials: true,
    },
    allowRequest: (req, callback) => {
        const fakeRes = {
            getHeader() {
                return [];
            },
            setHeader(key, values) {
                req.cookieHolder = values[0];
            },
            writeHead() {},
        };
        sessionMiddleware(req, fakeRes, () => {
            if (req.session) {
                fakeRes.writeHead();
                req.session.save();
            }
            callback(null, true);
        });
    },
});
io.engine.on('initial_headers', (headers, req) => {
    if (req.cookieHolder) {
        headers['set-cookie'] = req.cookieHolder;
        delete req.cookieHolder;
    }
});
io.use(wrap(sessionMiddleware));

io.on('connection', socket => {
    registerPlayerHandlers(io, socket);
    if (socket.request.session.roomId) {
        socket.join(socket.request.session.roomId);
        socket.emit('player:data', JSON.stringify(session));
        io.to(socket.request.session.roomId).emit('player joined');
    }
});

//ROUTES CONFIG
const roomRoutes = require('./routes/room');
const playerRoutes = require('./routes/player');
const gameRoutes = require('./routes/game');

app.use('/player', playerRoutes);
app.use('/room', roomRoutes);
app.use('/game', gameRoutes);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('/app/build'));
    app.get('/', (req, res) => {
        res.sendFile('/app/build/index.html');
    });
}
