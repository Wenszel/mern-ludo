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

function getPosition(rolledNumber, pawn){
    const { position, color } = pawn;
    switch (color){
        case 'red': 
            if(pawn.position + rolledNumber <= 73){
                if(position >= 0 && position <= 3) {
                    return 16;
                }else if(position <= 66 && position + rolledNumber >= 67){
                    return position + rolledNumber + 1;
                }else{
                    return position + rolledNumber;
                }
            }else{
                return position;
            }
        case 'blue': 
            if(pawn.position + rolledNumber <= 79){
                if(position >= 4 && position <= 7){
                    return 55;
                }else if(position <= 67 && position + rolledNumber > 67){
                    return position + rolledNumber - 52; 
                }else if(position <= 53 && position + rolledNumber >= 54){
                    return position + rolledNumber + 20;
                }else{
                    return position + rolledNumber;
                }
            }else{
                return position;
            }
        case 'green': 
            if(pawn.position + rolledNumber <= 85){
                if(position >= 8 && position <= 11){
                    return 42;
                }else if(position <= 67 && position + rolledNumber > 67){
                    return position + rolledNumber - 52; 
                }else if(position <= 40 && position + rolledNumber >= 41){
                    return position + rolledNumber + 39;
                }else{
                    return position + rolledNumber;
                }
            }else{
                return position;
            }
        case 'yellow': 
            if(pawn.position + rolledNumber <= 85){
                if(position >= 12 && position <= 15){
                    return 29;
                }else if(position <= 67 && position + rolledNumber > 67){
                    return position + rolledNumber - 52; 
                }else if(position <= 27 && position + rolledNumber >= 28){
                    return position + rolledNumber + 58;
                }else{
                    return position + rolledNumber;
                }
            }else{
                return position;
            }
    }
};

module.exports = router;