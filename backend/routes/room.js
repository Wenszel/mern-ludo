var express = require('express');
var router = express.Router();

var RoomModel = require('../schemas/room');

//creating new room in db
router.post('/add', function (req, res) {

    //setting values from request to object
    let newRoom = new RoomModel({
        id: req.body.id,
        createDate: req.body.createDate,
        started: req.body.started,
        players: req.body.players,
        positions: req.body.positions
    });

    //saving room in db
    newRoom.save()
    .then(() => res.status(200).json('Added new room'))
    .catch(err => res.status(400).json('Error: ' + err));

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