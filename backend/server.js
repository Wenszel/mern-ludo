const express = require("express");
const app = express();
const PORT = 3000|| process.env.PORT;
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

app.listen(PORT, ()=>{
    console.log("Server runs on port "+PORT);
});