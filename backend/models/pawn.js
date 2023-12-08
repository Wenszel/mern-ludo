const mongoose = require('mongoose');

const Schema = mongoose.Schema;

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
    if (this.position !== this.getPositionAfterMove(rolledNumber) && this.position !== this.basePos) {
        return true;
    }
    return false;
};

PawnSchema.methods.getPositionAfterMove = function (rolledNumber) {
    const { position, color } = this;
    switch (color) {
        case 'red':
            if (position + rolledNumber <= 73) {
                if (position >= 0 && position <= 3) {
                    return 16;
                } else if (position <= 66 && position + rolledNumber >= 67) {
                    return position + rolledNumber + 1;
                } else {
                    return position + rolledNumber;
                }
            } else {
                return position;
            }
        case 'blue':
            if (position + rolledNumber <= 79) {
                if (position >= 4 && position <= 7) {
                    return 55;
                } else if (position <= 67 && position + rolledNumber > 67) {
                    return position + rolledNumber - 52;
                } else if (position <= 53 && position + rolledNumber >= 54) {
                    return position + rolledNumber + 20;
                } else {
                    return position + rolledNumber;
                }
            } else {
                return position;
            }
        case 'green':
            if (position + rolledNumber <= 85) {
                if (position >= 8 && position <= 11) {
                    return 42;
                } else if (position <= 67 && position + rolledNumber > 67) {
                    return position + rolledNumber - 52;
                } else if (position <= 40 && position + rolledNumber >= 41) {
                    return position + rolledNumber + 39;
                } else {
                    return position + rolledNumber;
                }
            } else {
                return position;
            }
        case 'yellow':
            if (position + rolledNumber <= 85) {
                if (position >= 12 && position <= 15) {
                    return 29;
                } else if (position <= 67 && position + rolledNumber > 67) {
                    return position + rolledNumber - 52;
                } else if (position <= 27 && position + rolledNumber >= 28) {
                    return position + rolledNumber + 58;
                } else {
                    return position + rolledNumber;
                }
            } else {
                return position;
            }
    }
};

module.exports = PawnSchema;
