var express = require('express');
var router = express.Router();

//starts game
router.post('/start', function (req, res){
    /* set interval:
        draw a number <1,6>
        update positions 
    */
    
});
router.get('/roll', function (req, res){
    res.send({number: Math.ceil(Math.random() * 6)});
});


module.exports = router;