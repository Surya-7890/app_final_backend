const express = require('express');
const Room = require('../models/room');
const Hod = require('../models/hod');
const router = express.Router();
const { Event } = require('../server');
const { bookARoom } = require('../functions/book');
const { format } = require('../functions/formatString');

router.get('/initial/mobile', async (req, res) => {
  try {
    const room = await Room
      .find({})
      .select({ name: 1, isAvailable: 1, isMaintenanceRequired: 1, allocatedTime: 1 });
      res.json({ data: room, message: "Success" });
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
});

router.post('/approve/booking', async (req, res) => {
  try {
    const room = await bookARoom(req.body);
    if (room?.message !== 'Success') {
      res.json({ error: room })
    } else {
      Event.emit('booked', room.data) // to be handled
      res.json({ message: 'Success', room: room.data });
    }
  } catch (error) {
    
  }
})

router.post('/request/booking', async (req, res) => {
  const { from, to, name, email, reason, department } = req.body;
  try {
    const allocatedTime = format(from, to);
    const data = { allocatedTime, name, email, reason };
    const room = await Room.findOne({ name });
    room.waiting.push({ email, allocatedTime });
    const hod = await Hod.findOne({ department });
    hod.notifications.push(data);
    await hod.save();
    res.json({ message: 'Success' });
  } catch (error) {
    res.json({ message: error.message });
  }
})

module.exports = router;