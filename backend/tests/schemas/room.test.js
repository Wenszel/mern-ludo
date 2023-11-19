const { expect } = require('chai');
const RoomModel = require('../../schemas/room');
const { getPawnPositionAfterMove, getStartPositions } = require('../../utils/functions');
describe('Testing room model methods', function () {
    const room = new RoomModel();

    beforeEach(function () {
        room.players = [];
        room.pawns = getStartPositions();
    });
    it('should correctly beat pawn', function () {
        room.addPlayer('test1', 'red');
        room.addPlayer('test2', 'blue');
        room.pawns.forEach(pawn => {
            pawn.position = getPawnPositionAfterMove(1, pawn);
        });
        room.beatPawns(16, 'green');
        room.pawns.forEach(pawn => {
            if (pawn.color != 'red') {
                expect(pawn.position).to.not.equal(pawn.basePos);
            } else {
                expect(pawn.position).to.equal(pawn.basePos);
            }
        });
    });

    it('should correctly beat multiple pawns', function () {
        room.pawns[0].position = 16;
        room.pawns[1].position = 16;
        room.beatPawns(16, 'green');
        room.pawns.forEach(pawn => {
            expect(pawn.position).to.equal(pawn.basePos);
        });
    });

    it('should correctly change moving player from last to first', function () {
        room.addPlayer('test1', 'red');
        room.addPlayer('test2', 'blue');
        room.players[1].nowMoving = true;
        room.changeMovingPlayer();
        expect(room.players[0].nowMoving).to.equal(true);
    });

    it('should correctly change moving player from first to second', function () {
        room.addPlayer('test1', 'red');
        room.addPlayer('test2', 'blue');
        room.players[0].nowMoving = true;
        room.changeMovingPlayer();
        expect(room.players[1].nowMoving).to.equal(true);
    });

    it('should correctly returns pawns that can move', function () {
        room.addPlayer('test1', 'red');
        room.addPlayer('test2', 'blue');
        room.players[0].nowMoving = true;
        room.pawns[0].position = 16;
        room.rolledNumber = 2;
        const pawnsThatCanMove = room.getPawnsThatCanMove();
        expect(pawnsThatCanMove.length).to.equal(1);
    });

    it('should given rolled 6 correctly returns pawns that can move', function () {
        room.addPlayer('test1', 'red');
        room.addPlayer('test2', 'blue');
        room.players[0].nowMoving = true;
        room.pawns[0].position = 16;
        room.rolledNumber = 6;
        const pawnsThatCanMove = room.getPawnsThatCanMove();
        expect(pawnsThatCanMove.length).to.equal(4);
    });
});
