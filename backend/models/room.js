const mongoose = require('mongoose');
const { colors } = require('../utils/constants');
const { getPawnPositionAfterMove, getStartPositions } = require('../utils/functions');
const { makeRandomMove } = require('../handlers/handlersFunctions');
const PawnSchema = require('./pawn');
const PlayerSchema = require('./player');

const RoomSchema = new mongoose.Schema({
    name: String,
    private: { type: Boolean, default: true },
    password: String,
    createDate: { type: Date, default: Date.now },
    started: { type: Boolean, default: false },
    full: { type: Boolean, default: false },
    nextMoveTime: Number,
    timeoutID: Number,
    rolledNumber: Number,
    players: [PlayerSchema],
    pawns: { type: [PawnSchema], default: getStartPositions() },
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
    this.timeoutID = setTimeout(makeRandomMove, 15000, this._id.toString());
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
};

RoomSchema.methods.changePositionOfPawn = function (pawn, newPosition) {
    const pawnIndex = this.getPawnIndex(pawn._id);
    this.pawns[pawnIndex].position = newPosition;
};

RoomSchema.methods.canStartGame = function () {
    return this.players.filter(player => player.ready).length >= 2;
};

RoomSchema.methods.startGame = function () {
    this.started = true;
    this.nextMoveTime = Date.now() + 15000;
    this.players.forEach(player => (player.ready = true));
    this.players[0].nowMoving = true;
    this.timeoutID = setTimeout(makeRandomMove, 15000, this._id.toString());
};

RoomSchema.methods.isFull = function () {
    if (this.players.length === 4) {
        this.full = true;
    }
    return this.full;
};

RoomSchema.methods.getPlayer = function (playerId) {
    return this.players.find(player => player._id.toString() === playerId.toString());
};

RoomSchema.methods.addPlayer = function (name, id) {
    if (this.full) return;
    this.players.push({
        sessionID: id,
        name: name,
        ready: false,
        color: colors[this.players.length],
    });
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

const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;
