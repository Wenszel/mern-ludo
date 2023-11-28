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

const createNewRoom = data => {
    const room = new Room(data);
    room.save();
    return room;
};

const findPlayer = async sessionID => {
    const player = await Room.findOne({ 'players.sessionID': sessionID }).exec();
    console.log(player);
    return await Room.findOne({ 'players.sessionID': sessionID }).exec();
};

Room.watch().on('change', async data => {
    sendToPlayersData(await getRoom(data.documentKey._id));
});

module.exports = { getRoom, getRooms, updateRoom, getJoinableRoom, createNewRoom, findPlayer };
