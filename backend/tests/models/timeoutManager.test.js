const chai = require('chai');
const sinon = require('sinon');
const timeoutManager = require('../../models/timeoutManager');

const { expect } = chai;

describe('timeoutManager', () => {
    beforeEach(() => {
        timeoutManager.timeouts.clear();
        sinon.useFakeTimers({ shouldClearNativeTimers: true });
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should add a timeout to the map', () => {
        timeoutManager.add('room1', 1);
        expect(timeoutManager.timeouts.size).to.equal(1);
    });

    it('should get a timeout from the map', () => {
        timeoutManager.add('room1', 1);
        const timeoutId = timeoutManager.get('room1');
        expect(timeoutId).to.equal(1);
    });

    it('should clear a timeout from the map', () => {
        timeoutManager.add('room1', 1);
        timeoutManager.clear('room1');
        expect(timeoutManager.timeouts.size).to.equal(0);
    });

    it('should set a new timeout', () => {
        const timeoutFunction = sinon.spy();
        timeoutManager.set(timeoutFunction, 100, 'room1');
        expect(timeoutManager.timeouts.size).to.equal(1);
        sinon.clock.tick(101);
        sinon.assert.calledOnce(timeoutFunction);
    });

    it('should not call the timeout function if cleared', () => {
        const timeoutFunction = sinon.spy();
        timeoutManager.set(timeoutFunction, 100, 'room1');
        timeoutManager.clear('room1');
        sinon.clock.tick(101);
        sinon.assert.notCalled(timeoutFunction);
        expect(timeoutManager.timeouts.size).to.equal(0);
    });
});
