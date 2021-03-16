var express = require('express');
var router = express.Router();

var RoomModel = require('../schemas/room');

//creating new room in db
router.post('/add', function (req, res) {
    console.log(req.session);
    RoomModel.findOne( { full: false, started: false }, function (err, results) {
        if (err) { 
            console.log(err);
        }
        if (!results) {
            let newRoom = new RoomModel({
                createDate: new Date,
                full: false,
                started: false,
                players: [req.body.name],
            });
            newRoom.save()
                .then( async function(){
                        req.session.roomId = newRoom._id;
                        req.session.player = req.body.name;
                    
                    res.send({id: newRoom._id}); 
                })
                .catch(err => res.status(400).json('Error: ' + err))
                
        }else {      
            let players = results.players;
            players.push(req.body.name);
            let updateObj = {
                players: players,
            }
            players.length === 4 ? updateObj.full = true : updateObj.full = false;
            RoomModel.findOneAndUpdate(
                { _id: results._id }, 
                updateObj,
                function (err, docs) { 
                    if (err){ 
                        console.log(err) 
                    } 
                    else{ 
                        req.session.roomId = results._id;
                req.session.player = req.body.name;
                        console.log("Updated Docs : ", docs); 
                    } 
                }
            ).then(()=>{
                req.session.roomId = results._id;
                req.session.player = req.body.name;
                console.log(req.session);
                res.send({
                    id: results._id,
                    player: req.session.player
                }); 
            });
            
        }
        
    });
    
});

//deleting room after game ends
router.delete('/delete/{id}', function(req,res){
    
});

//editing room every move
router.put('/edit', function(req,res){

});

//get room values
router.get('/', function(req,res){

});

module.exports = router;