const express = require("express");
const mangoose = require("mangoose");
const app = express();
const PORT = 3000|| process.env.PORT;
app.listen(PORT, ()=>{
    console.log("Server runs on port "+PORT);
});