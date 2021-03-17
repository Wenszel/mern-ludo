const express = require("express");
const cors = require('cors');
const cookieParser = require('cookie-parser')
const session = require('express-session')
const bodyParser = require('body-parser');

const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.set('trust proxy', 1)
app.use(cors({
  origin: [
    'localhost:3001',
    'http://localhost:3001',
    'https://localhost:3001'
  ],
  credentials: true,
}))
const PORT = 3000|| process.env.PORT;

//DATABASE CONFIG
const mongoose = require("mongoose");
const CONNECTION_URI = require("./credentials.js").MONGODB_URL;

mongoose.connect(CONNECTION_URI, {
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
  uri: CONNECTION_URI,
  collection: 'mySessions'
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

//ROUTES CONFIG
const roomRoutes = require("./routes/room");
const playerRoutes = require("./routes/player");

app.get('/', (req,res)=>{
  if(req.session.player){
    res.json({
      player: req.session.player,
      roomId: req.session.roomId,
    })
  }
})

app.use('/player', playerRoutes);
app.use('/room', roomRoutes);

app.listen(PORT, ()=>{
    console.log("Server runs on port "+PORT);
});