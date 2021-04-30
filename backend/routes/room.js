const express = require('express');
const router = express.Router();
const RoomModel = require('../schemas/room');

const colors = ['red','blue','green','yellow'];

function getStartPositions(){
    const startPositions = [];
    for( let i = 0; i < 16; i++){
        let pawn = {};
        pawn.basePos = i;
        pawn.position = i;
        if(i < 4) pawn.color = colors[0];
        else if(i < 8) pawn.color = colors[1];
        else if(i < 12) pawn.color = colors[2];
        else if (i < 16) pawn.color = colors[3]
        startPositions.push(pawn);
    }
    return startPositions;
}

//creating new room in db
router.post('/add', function (req, res) {
    RoomModel.findOne( { full: false, started: false }, function (err, results) {
        if (err) console.log(err);
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
                pawns: getStartPositions(),
            });
            newRoom.save()
                .then(function(){
                    req.session.roomId = newRoom._id;
                    req.session.playerId = newRoom.players[0]._id;
                    req.session.color = newRoom.players[0].color;
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
                updateObj.nextMoveTime = Date.now() + 15000;
                updateObj.players = updateObj.players.map(player => player.ready === true);
                updateObj.players[0].nowMoving = true; //First joined player moving
                updateObj.pawns = getStartPositions();
            }
            RoomModel.findOneAndUpdate(
                { _id: results._id }, //find room by id
                updateObj)
                .then(()=>{
                    req.session.roomId = results._id;
                    req.session.playerId = updateObj.players[updateObj.players.length-1]._id;
                    req.session.color = colors[updateObj.players.length-1];
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
                if(docs){
                    if(docs.nextMoveTime <= Date.now()){ 
                        RoomModel.findOne({_id: req.session.roomId}, function (err, doc){    
                            if (err) {
                                res.status(500).send(err)
                            } else {
                                const index = doc.players.findIndex( player => player.nowMoving === true);
                                const roomSize = doc.players.length;
                                doc.players[index].nowMoving = false;
                                if(index + 1 === roomSize){
                                    doc.players[0].nowMoving = true;
                                }else{
                                    doc.players[index + 1].nowMoving = true;
                                }
                                doc.nextMoveTime = Date.now()+15000;
                                RoomModel.findOneAndUpdate({_id: req.session.roomId}, doc, function(err, docs){
                                    if(err){
                                        res.status(500).send(err)
                                    }else{
                                        res.send(docs); 
                                    }
                                });

                            }
                        });  
                    }else{
                        res.send(docs); 
                    }
                    
                }
            } 
        }
    )
});

module.exports = router;
