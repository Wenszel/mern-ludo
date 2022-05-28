const session = require("express-session");
const CONNECTION_URI = require("../credentials.js");
const MongoDBStore = require("connect-mongodb-session")(session);
const store = new MongoDBStore({
  uri: CONNECTION_URI,
  collection: "sessions",
});
const sessionMiddleware = session({
  secret: "lalala",
  resave: true,
  saveUninitialized: false,
  store: store,
  credentials: true,
  cookie: {
    httpOnly: false,
    secure: false,
  },
});

const wrap = (expressMiddleware) => (socket, next) =>
  expressMiddleware(socket.request, {}, next);

module.exports = { sessionMiddleware, wrap };
