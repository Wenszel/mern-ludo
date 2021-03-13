const express = require("express");
const cors = require('cors');
const app = express();
app.use(cors());
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

//ROUTES CONFIG
const roomRoutes = require("./routes/room");
const playerRoutes = require("./routes/player");

app.use('/player', playerRoutes);
app.use('/room', roomRoutes);

app.listen(PORT, ()=>{
    console.log("Server runs on port "+PORT);
});