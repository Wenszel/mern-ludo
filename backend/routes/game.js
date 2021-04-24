var express = require('express');
var router = express.Router();

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
    res.send({number: Math.ceil(Math.random() * 6)});
});


module.exports = router;