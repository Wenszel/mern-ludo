var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var GameRoomSchema = new Schema({
    id: Number,
    createDate: Date,
    started: Boolean,
    players: Array,
    positions: Map
});

var GameRoomModel = mongoose.model('GameRoomModel', GameRoomSchema );