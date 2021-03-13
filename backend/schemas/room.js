var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var RoomSchema = new Schema({
    id: Number,
    createDate: Date,
    started: Boolean,
    players: Array,
    positions: Map
});

var RoomModel = mongoose.model('RoomModel', RoomSchema );