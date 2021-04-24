var express = require('express');
var router = express.Router();

var RoomModel = require('../schemas/room');

var colors = ['red','blue','green','yellow'];

//creating new room in db
router.post('/add', function (req, res) {
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
                    name: req.body.name,
                    nowMoving: false,
                    ready: false,
                    color: colors[0]
                }],
            });
            newRoom.save()
                .then(function(){
                    req.session.roomId = newRoom._id;
                    req.session.playerId = newRoom.players[0]._id;
                    req.session.name = req.body.name;
                    res.status(200).send(req.session.playerId); 
                })
                .catch(err => res.status(400).json('Error: ' + err))
        }else {      
            let players = results.players;

            players.push({
                    name: req.body.name,
                    ready: false,
                    color: colors[players.length]
            });

            let updateObj = { players: players }
            // Checks if room is full => if true start game
            if (players.length === 4) {
                updateObj.full = true; // Room is full 
                updateObj.started = true; // Game started
                updateObj.players[0].nowMoving = true; //First joined player moving
            }
            RoomModel.findOneAndUpdate(
                { _id: results._id }, //find room by id
                updateObj)
                .then(()=>{
                    req.session.roomId = results._id;
                    req.session.playerId = updateObj.players[updateObj.players.length-1]._id;
                    req.session.name = req.body.name;
                    res.status(200).send(req.session.playerId); 
                });  
                 
        } 
    });
    
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
                res.send(docs); 
            } 
        }
    )
});

module.exports = router;