const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PlayerSchema = new Schema({
    name: String,
    color: String,
    ready: { type: Boolean, default: false },
    nowMoving: { type: Boolean, default: false },
});

PlayerSchema.methods.changeReadyStatus = function () {
    this.ready = !this.ready;
};

module.exports = PlayerSchema;
