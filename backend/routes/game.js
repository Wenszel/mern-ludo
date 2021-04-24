var express = require('express');
var router = express.Router();

router.get('/roll', function (req, res){
    res.send({number: Math.ceil(Math.random() * 6)});
});


module.exports = router;