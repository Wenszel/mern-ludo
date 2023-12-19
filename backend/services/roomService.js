const Room = require('../models/room');
const { sendToPlayersData } = require('../socket/emits');

const getRoom = async roomId => {
    return await Room.findOne({ _id: roomId }).exec();
};

const getRooms = async () => {
    return await Room.find().exec();
};

const updateRoom = async room => {
    return await Room.findOneAndUpdate({ _id: room._id }, room).exec();
};

const getJoinableRoom = async () => {
    return await Room.findOne({ full: false, started: false }).exec();
};

const createNewRoom = async data => {
    const room = new Room(data);
    await room.save();
    return room;
};

Room.watch().on('change', async data => {
    sendToPlayersData(await getRoom(data.documentKey._id));
});

module.exports = { getRoom, getRooms, updateRoom, getJoinableRoom, createNewRoom };
