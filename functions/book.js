const { months } = require('../utils/month.js');
const Room = require('../models/room');

const bookARoom = async (input) => {
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
        room.AddScheduler({
            hour: Number(toHour),
            minute: Number(toMinute),
            date: Number(toDate),
            month: months[toMonth],
            year: Number(toYear)
        })
        return { 
            message: 'Success',
            data: room
        };
    } catch (error) {
        return error.message;
    }
}

module.exports = { bookARoom };