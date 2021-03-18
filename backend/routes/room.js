var express = require('express');
var router = express.Router();

var RoomModel = require('../schemas/room');

var colors = ['red','blue','green','yellow'];

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
                players: [{
                    player: req.body.name,
                    color: colors[0]
                }],
            });
            newRoom.save()
                .then(function(){
                        req.session.roomId = newRoom._id;
                        req.session.player = req.body.name;
                    
                    res.status(200).send('Joined!'); 
                })
                .catch(err => res.status(400).json('Error: ' + err))
                
        }else {      
            let players = results.players;
            players.push(
                {
                    player: req.body.name,
                    color: colors[players.length]
                }
                
                );
            let updateObj = {
                players: players,
            }
            players.length === 4 ? updateObj.full = true : updateObj.full = false;
            RoomModel.findOneAndUpdate(
                { _id: results._id }, //find room by id
                updateObj,  
                function (err, docs) { 
                    if (err){ 
                        console.log(err) 
                    } 
                    else{ 
                        console.log("Updated Docs : ", docs); 
                    } 
                }
            ).then(()=>{
                req.session.roomId = results._id;
                req.session.player = req.body.name;
                res.status(200).send('Joined!'); 
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
    RoomModel.findOne(
        { _id: req.session.roomId }, //find room by id
        function (err, docs) { 
            if (err){ 
                console.log(err) 
            } 
            else{ 
                console.log(docs)
                res.send({ players: docs.players}); 
            } 
        }
    )
});

module.exports = router;