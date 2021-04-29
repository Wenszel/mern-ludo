var express = require('express');
var router = express.Router();
const RoomModel = require('../schemas/room');

function setNextPlayer(req, res){
    RoomModel.findOne({_id: req.session.roomId}, function (err, doc){    
        if (err) {
            res.status(500).send(err)
        } else {
            const index = doc.players.findIndex( player => player.nowMoving === true);
            const roomSize = doc.player.length;
            doc.players[index].nowMoving = false;
            if(index++ === roomSize){
                doc.players[0].nowMoving = true;
            }else{
                doc.players[index].nowMoving = true;
            }
            RoomModel.findOneAndUpdate({_id: req.session.roomId}, doc);
        }
    });  
}

router.get('/roll', function (req, res){
    const rolledNumber = Math.ceil(Math.random() * 6);
    req.session.rolledNumber = rolledNumber;
    res.send({number: rolledNumber});
});

router.post('/move', async function (req, res){
    const rolledNumber = req.session.rolledNumber;
    req.session.rolledNumber = null;
    const room = await RoomModel.findOne({_id: req.session.roomId});
    console.log(room);
    const indexOfMovedPawn = room.pawns.findIndex( pawn => pawn._id === req.body.pawnId);
    let { position } = room.pawns[indexOfMovedPawn];
    switch (req.session.color){
        case 'red': 
            if(position >= 0 && position <= 3){
                position = 4;
            }else if(position > 15 && position + rolledNumber <= 66){
                position = position + rolledNumber;
            }else{
                position =  67 + (position + rolledNumber - 66);
            }
            break;
        case 'blue': 
            if(position >= 4 && position <= 7){
                position = 55;
            }else if(position+rolledNumber>55 || position+rolledNumber <= 53){
                position = position + rolledNumber;
            }else{
                position =  71 + (position + rolledNumber - 53);
            }
            break;
        case 'green': 
            if(pawn.position >= 8 && pawn.position <= 11){
                position = 42;
            }else if(position + rolledNumber > 42 || position+rolledNumber <= 40){
                position = position + rolledNumber;
            }else{
                position = 76 - (position + rolledNumber - 40)
            }
            break;
        case 'yellow': 
            if(pawn.position >= 12 && pawn.position <= 15){
                return 29;
            }else if(position + rolledNumber > 29 || position+rolledNumber <= 27){
                position = position + rolledNumber;
            }else{
                position = 82 + (position + rolledNumber - 27)
            }
            break;
    }
    RoomModel.findOneAndUpdate({_id: req.session.roomId, 'pawnw._id': req.body.pawnId}, room);
    res.send("Correctly Moved!");
});


module.exports = router;