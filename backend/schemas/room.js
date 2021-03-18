var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var RoomSchema = new Schema({
    createDate: Date,
    started: Boolean,
    full: Boolean,
    players: [{
        player: String,
        color: String,
    }],
    positions: Map
});

var RoomModel = mongoose.model('RoomModel', RoomSchema );

module.exports = RoomModel;