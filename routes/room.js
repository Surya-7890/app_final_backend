const express = require('express');
const Room = require('../models/room');
const Hod = require('../models/hod');
const router = express.Router();
const { bookARoom } = require('../functions/book');
const { format } = require('../functions/formatString');
const { isHod } = require('../middlewares/hod');
const { isUser } = require('../middlewares/user');
const { scheduler } = require('../functions/scheduler');

router.get('/initial/mobile', isUser, async (req, res) => {
  try {
    const room = await Room
      .find({})
      .select({ name: 1, isAvailable: 1, isMaintenanceRequired: 1, allocatedTime: 1 });
      res.json({ data: room, message: "Success" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/approve/booking', isHod, async (req, res) => {
  const io = req.app.get('socket')
  try {
    const room = await bookARoom(req.body, io);
    if (room?.message !== 'Success') {
      res.json({ error: room })
    } else {
      io.emit('booked', room.data)
      res.json({ message: 'Success', room: room.data });
    }
  } catch (error) {
    
  }
})

router.post('/request/booking', isUser, async (req, res) => {
  const { from, to, name, reason } = req.body;
  const { email, department } = req.staff;
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
});

router.post('/hod/book', isHod, async (req, res) => {
  const { name, from, to, reason } = req.body;
  const email = req.email;
  const io = req.app.get('socket')
  try {
    const allocatedTime = format(from, to);
    const room = await Room.findOne({ name });
    room.bookedBy = email;
    room.approvedBy = email;
    room.allocatedTime = allocatedTime;
    room.isAvailable = false;
    room.waiting = [];
    room.reason = reason;
    await scheduler(room, allocatedTime, io);
    await room.save()
    res.status(200).json({ message: 'Success', data: room });
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.get('/get-booked', isUser, async (req, res) => {
  const { email, role } = req.staff;
  try {
    const data = await Room.find({ bookedBy: email });
    if (role === 'hod') {
      const notifications = await Hod.findOne({ email });
      res.json({ message: 'Success', data, notifications: notifications.notifications.length })
    } else {
      res.json({ message: 'Success', data });
    }
  } catch (error) {
    res.json({ message: error.message });
  }
});

module.exports = router;