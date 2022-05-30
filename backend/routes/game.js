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
            // Updating position
            const updatedPawn = doc.pawns.findIndex(pawn => pawn._id == req.body.pawnId);
            doc.pawns[updatedPawn].position = getPosition(req.session.rolledNumber, doc.pawns[updatedPawn]);
            console.log(getPosition(req.session.rolledNumber, doc.pawns[updatedPawn]));
            // Capturing a pawn
            const pawnsOnPos = doc.pawns.filter( pawn => pawn.position == doc.pawns[updatedPawn].position);
            pawnsOnPos.forEach( pawn => {
                if(pawn.color !== req.session.color){
                    const index = doc.pawns.findIndex(i => i._id === pawn._id);
                    doc.pawns[index].position = doc.pawns[index].basePos;
                }
            });
            // Updating moving player
            const index = doc.players.findIndex( player => player.nowMoving === true);
            const roomSize = doc.players.length;
            doc.players[index].nowMoving = false;
            if(index+1 === roomSize){
                doc.players[0].nowMoving = true;
            }else{
                doc.players[index+1].nowMoving = true;
            }
            // Updating timer
            doc.nextMoveTime = Date.now()+15000;
            // Pushing above data to database
            RoomModel.findOneAndUpdate({_id: req.session.roomId}, doc, function(err, doc){
                res.send("Correctly Moved!");
            });
        }
    });
});



module.exports = router;