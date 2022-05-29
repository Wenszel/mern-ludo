const express = require("express");
const router = express.Router();
const RoomModel = require("../schemas/room");


//get room values
router.get("/", function (req, res) {
    RoomModel.findOne(
        { _id: req.session.roomId }, //find room by id
        function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                if (docs) {
                    if (docs.nextMoveTime <= Date.now()) {
                        RoomModel.findOne({ _id: req.session.roomId }, function (err, doc) {
                            if (err) {
                                res.status(500).send(err);
                            } else {
                                const index = doc.players.findIndex(player => player.nowMoving === true);
                                const roomSize = doc.players.length;
                                doc.players[index].nowMoving = false;
                                if (index + 1 === roomSize) {
                                    doc.players[0].nowMoving = true;
                                } else {
                                    doc.players[index + 1].nowMoving = true;
                                }
                                doc.nextMoveTime = Date.now() + 15000;
                                RoomModel.findOneAndUpdate({ _id: req.session.roomId }, doc, function (err, docs) {
                                    if (err) {
                                        res.status(500).send(err);
                                    } else {
                                        res.send(docs);
                                    }
                                });
                            }
                        });
                    } else {
                        res.send(docs);
                    }
                }
            }
        }
    );
});

module.exports = router;
