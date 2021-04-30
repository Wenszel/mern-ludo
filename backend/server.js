const express = require("express");
const cors = require('cors');
const cookieParser = require('cookie-parser')
const session = require('express-session')

const app = express();
app.use(cookieParser());
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
app.set('trust proxy', 1)
app.use(cors({
  origin: [
    'http://localhost:5000',
    'https://localhost:5000',
    'http://localhost:3001',
  ],
  credentials: true,
}))
const PORT = process.env.PORT;

//DATABASE CONFIG
const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);
//const CONNECTION_URI = require("./credentials.js").MONGODB_URL;

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('MongoDB Connected…');
  })
.catch(err => console.error(err));

//SESSION CONFIG]
var MongoDBStore = require('connect-mongodb-session')(session);
var store = new MongoDBStore({
  uri: process.env.MONGODB_URL,
  collection: 'sessions'
});
app.use(session({
  secret: 'lalala',
  resave: true,
  saveUninitialized: false,
  store: store,
  cookie: { 
    httpOnly: false,
    secure: false,},
}));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('/app/build'))
  app.get('/', (req, res) => {
    res.sendFile('/app/build/index.html')
  });
}

//ROUTES CONFIG
const roomRoutes = require("./routes/room");
const playerRoutes = require("./routes/player");
const gameRoutes = require("./routes/game");

app.use('/player', playerRoutes);
app.use('/room', roomRoutes);
app.use('/game', gameRoutes)

app.listen(PORT, ()=>{
    console.log("Server runs on port "+PORT);
});