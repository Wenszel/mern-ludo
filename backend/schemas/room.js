var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var RoomSchema = new Schema({
    createDate: Date,
    started: { type: Boolean, default: false },
    full: { type: Boolean, default: false },
    nextMoveTime: Number,
    timeoutID: Number,
    rolledNumber: Number,
    players: [
        {
            name: String,
            color: String,
            ready: { type: Boolean, default: false },
            nowMoving: { type: Boolean, default: false },
        },
    ],
    pawns: [
        {
            color: String,
            basePos: Number,
            position: Number,
        },
    ],
});

var RoomModel = mongoose.model('RoomModel', RoomSchema);

module.exports = RoomModel;
