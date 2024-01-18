const timeoutManager = {
    timeouts: new Map(),
    add: function (roomId, timeoutId) {
        this.timeouts.set(roomId, timeoutId);
    },
    get: function (roomId) {
        return this.timeouts.get(roomId);
    },
    clear: function (roomId) {
        clearTimeout(this.timeouts.get(roomId));
        this.timeouts.delete(roomId);
    },
    set: function (timeoutFunction, time, roomId) {
        const timeoutId = setTimeout(timeoutFunction, time, roomId);
        this.add(roomId, timeoutId);
    },
};

module.exports = timeoutManager;
