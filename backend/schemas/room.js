const mongoose = require('mongoose');
const { getPawnPositionAfterMove } = require('../utils/functions');
const Schema = mongoose.Schema;
const PawnSchema = require('./pawn');
const PlayerSchema = require('./player');

const RoomSchema = new Schema({
    createDate: Date,
    started: { type: Boolean, default: false },
    full: { type: Boolean, default: false },
    nextMoveTime: Number,
    timeoutID: Number,
    rolledNumber: Number,
    players: [PlayerSchema],
    pawns: [PawnSchema],
});

RoomSchema.methods.beatPawns = function (position, attackingPawnColor) {
    const pawnsOnPosition = this.pawns.filter(pawn => pawn.position === position);
    pawnsOnPosition.forEach(pawn => {
        if (pawn.color !== attackingPawnColor) {
            const index = this.getPawnIndex(pawn._id);
            this.pawns[index].position = this.pawns[index].basePos;
        }
    });
};

RoomSchema.methods.changeMovingPlayer = function () {
    const playerIndex = this.players.findIndex(player => player.nowMoving === true);
    this.players[playerIndex].nowMoving = false;
    if (playerIndex + 1 === this.players.length) {
        this.players[0].nowMoving = true;
    } else {
        this.players[playerIndex + 1].nowMoving = true;
    }
    this.nextMoveTime = Date.now() + 15000;
    this.rolledNumber = null;
    if (this.timeoutID) clearTimeout(this.timeoutID);
};

RoomSchema.methods.movePawn = function (pawn) {
    const newPositionOfMovedPawn = getPawnPositionAfterMove(this.rolledNumber, pawn);
    this.changePositionOfPawn(pawn, newPositionOfMovedPawn);
    this.beatPawns(newPositionOfMovedPawn, pawn.color);
};

RoomSchema.methods.getPawnsThatCanMove = function () {
    const movingPlayer = this.getCurrentlyMovingPlayer();
    const playerPawns = this.getPlayerPawns(movingPlayer.color);
    return playerPawns.filter(pawn => pawn.canMove(this.rolledNumber));
}

RoomSchema.methods.changePositionOfPawn = function (pawn, newPosition) {
    const pawnIndex = this.getPawnIndex(pawn._id);
    this.pawns[pawnIndex].position = newPosition;
};

RoomSchema.methods.getPawnIndex = function (pawnId) {
    return this.pawns.findIndex(pawn => pawn._id.toString() === pawnId.toString());
};

RoomSchema.methods.getPawn = function (pawnId) {
    return this.pawns.find(pawn => pawn._id.toString() === pawnId.toString());
};

RoomSchema.methods.getPlayerPawns = function (color) {
    return this.pawns.filter(pawn => pawn.color === color);
};

RoomSchema.methods.getCurrentlyMovingPlayer = function () {
    return this.players.find(player => player.nowMoving === true);
};

const RoomModel = mongoose.model('Room', RoomSchema);

module.exports = RoomModel;
