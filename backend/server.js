const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { sessionMiddleware } = require('./config/session');

const PORT = 8080;

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

const server = app.listen(PORT);

require('./config/database')(mongoose);
require('./config/socket')(server);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('/app/build'));
    app.get('/', (req, res) => {
        res.sendFile('/app/build/index.html');
    });
}

module.exports = { server };
