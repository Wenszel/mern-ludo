var express = require('express');
var router = express.Router();
var RoomModel = require('../schemas/room');


router.post('/ready', function (req, res){
    RoomModel.findOne({_id: req.session.roomId}, function (err, doc){    
        if (err) {
            res.status(500).send(err)
        } else {
            //finds player by id and changes ready state
            let updatedPlayers = doc.players;
            let index = updatedPlayers.findIndex( 
                player => (player._id).toString() == (req.session.playerId).toString()
            );
            updatedPlayers[index].ready = !updatedPlayers[index].ready;
            RoomModel.findOneAndUpdate({
                _id: req.session.roomId
            }, {players: updatedPlayers}, function(err, doc){
                if (err){ 
                    console.log(err) 
                } 
                else{ 
                    console.log("Updated Docs : ", doc); 
                }  
            });
            res.status(200).send("Ready!");
        }    
    });        
});

//deleting user in case he left before game started
router.post('/exit', function(req,res){
    console.log("wyszedł XD")
});

module.exports = router;