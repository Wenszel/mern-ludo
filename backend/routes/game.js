var express = require('express');
var router = express.Router();
const RoomModel = require('../schemas/room');

router.get('/roll', function (req, res){
    const rolledNumber = Math.ceil(Math.random() * 6);
    req.session.rolledNumber = rolledNumber;
    res.send({number: rolledNumber});
});

router.post('/move', function (req, res){
    RoomModel.findOne({_id: req.session.roomId}, function (err, doc){
        if(doc){
            const updatedPawn = doc.pawns.findIndex(pawn => pawn._id == req.body.pawnId);
            doc.pawns[updatedPawn].position = req.body.position;
            const index = doc.players.findIndex( player => player.nowMoving === true);
            const roomSize = doc.players.length;
            doc.players[index].nowMoving = false;
            if(index+1 === roomSize){
                doc.players[0].nowMoving = true;
            }else{
                doc.players[index+1].nowMoving = true;
            }
            doc.nextMoveTime = Date.now()+30000;
            RoomModel.findOneAndUpdate({_id: req.session.roomId}, doc, function(err, doc){
                res.send("Correctly Moved!");
            });
        }
    });
});


module.exports = router;