var express = require("express");
var router = express.Router();
var RoomModel = require("../schemas/room");
var changeReadyState = (req, res, exit) => {
  RoomModel.findOne({ _id: req.session.roomId }, function (err, doc) {
    if (err) {
      res.status(500).send(err);
    } else {
      //finds player by id and changes ready state
      let updatedPlayers = doc.players;
      let index = updatedPlayers.findIndex(
        (player) => player._id.toString() == req.session.playerId.toString()
      );
      if (!exit) updatedPlayers[index].ready = !updatedPlayers[index].ready;
      else updatedPlayers[index].ready = false;
      const updatedDoc = {
        players: updatedPlayers,
      };
      if (updatedPlayers.filter((player) => player.ready).length >= 2) {
        updatedDoc.started = true;
        updatedDoc.players.forEach((player) => (player.ready = true));
        updatedDoc.nextMoveTime = Date.now() + 15000;
        updatedDoc.players[0].nowMoving = true;
      }

      RoomModel.findOneAndUpdate(
        {
          _id: req.session.roomId,
        },
        updatedDoc,
        function (err, doc) {
          if (err) {
            console.log(err);
          } else {
            console.log("Updated Docs : ", doc);
          }
        }
      );
      res.status(200).send("Ready!");
    }
  });
};

//changing status of player to ready for game
router.post("/ready", function (req, res) {
  changeReadyState(req, res, false);
});

//deleting user in case he left before game started
router.post("/exit", function (req, res) {
  // changeReadyState(req,res, true)
});

module.exports = router;
