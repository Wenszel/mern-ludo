const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const { getPawnPositionAfterMove } = require('../utils/functions');

const PawnSchema = new Schema({
    color: String,
    basePos: Number,
    position: Number,
});

PawnSchema.methods.canMove = function (rolledNumber) {
    if (this.position === this.basePos && (rolledNumber === 6 || rolledNumber === 1)) {
        return true;
    }
    // (if player's pawn is near finish line) if the move does not go beyond the win line
    if (this.position !== getPawnPositionAfterMove(rolledNumber, this) && this.position !== this.basePos) {
        return true;
    }
    return false;
};

module.exports = PawnSchema;
