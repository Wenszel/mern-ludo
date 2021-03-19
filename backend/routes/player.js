var express = require('express');
var router = express.Router();
var RoomModel = require('../schemas/room');


router.post('/ready', function (req, res){
    RoomModel.findOne({_id: req.session.roomId}, function (err, doc){    
        if (err) {
            res.status(500).send(err)
        } else {
            let updatedPlayers = doc.players;
            let index = updatedPlayers.findIndex( player => player.name === req.session.name);
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


//adding users to exisiting room or creating new room if full
router.post('/add', function (req, res) {

});
//deleting user in case he left before game started
router.delete('/delete/{id}', function(req,res){
    
});

module.exports = router;