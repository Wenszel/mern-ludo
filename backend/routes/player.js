var express = require('express');
var router = express.Router();

//adding users to exisiting room or creating new room if full
router.post('/add', function (req, res) {

});
//deleting user in case he left before game started
router.delete('/delete/{id}', function(req,res){
    
});

module.exports = router;