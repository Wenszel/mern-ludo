const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { sessionMiddleware, wrap } = require("./controllers/serverController");
const app = express();
app.use(cookieParser());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
app.set("trust proxy", 1);
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
const PORT = 5000;
app.use(sessionMiddleware);
//DATABASE CONFIG
const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const CONNECTION_URI = require("./credentials.js");

mongoose
  .connect(CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB Connected…");
  })
  .catch((err) => console.error(err));

//SESSION CONFIG

if (process.env.NODE_ENV === "production") {
  app.use(express.static("/app/build"));
  app.get("/", (req, res) => {
    res.sendFile("/app/build/index.html");
  });
}
const server = app.listen(PORT, () => {
  console.log("Server runs on port " + PORT);
});
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});
io.use(wrap(sessionMiddleware));
io.on("connection", (socket) => {
  socket.emit("client data", JSON.stringify(socket.request.session));
});

//ROUTES CONFIG
const roomRoutes = require("./routes/room");
const playerRoutes = require("./routes/player");
const gameRoutes = require("./routes/game");

app.use("/player", playerRoutes);
app.use("/room", roomRoutes);
app.use("/game", gameRoutes);
