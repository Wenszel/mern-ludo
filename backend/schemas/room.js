var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var RoomSchema = new Schema({
    createDate: Date,
    started: Boolean,
    full: Boolean,
    players: [{
        name: String,
        color: String,
        ready: Boolean,
        nowMoving: Boolean,
    }],
    pawns: [{
        color: String,
        position: Number,
    }],
});

var RoomModel = mongoose.model('RoomModel', RoomSchema );

module.exports = RoomModel;