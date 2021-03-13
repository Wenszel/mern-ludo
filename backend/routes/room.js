var express = require('express');
var router = express.Router();

//creating new room in db
router.post('/add', function (req, res) {

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