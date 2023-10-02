const { scheduler } = require('./scheduler')
const Room = require('../models/room');

const bookARoom = async (input, io) => {
    try {
        const room = await Room.findOne({ name: input.name });

        room.isAvailable = false;
        room.allocatedTime = input.allocatedTime;
        room.bookedBy = input.bookedBy.email;
        room.approvedBy = input.approvedBy.email;
        room.reason = input.reason;
        room.waiting = [];
        await room.save();
        // function to add scheduler
        await scheduler(room, input.allocatedTime, io)
        return { 
            message: 'Success',
            data: room
        };
    } catch (error) {
        return error.message;
    }
}

module.exports = { bookARoom };