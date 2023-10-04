const express = require('express');
const Room = require('../models/room');
const Hod = require('../models/hod');
const router = express.Router();
const { bookARoom } = require('../functions/book');
const { format } = require('../functions/formatString');
const { isHod } = require('../middlewares/hod');
const { isUser } = require('../middlewares/user');
const { scheduler } = require('../functions/scheduler');
const Staff = require('../models/staff');

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
  const io = req.app.get('socket');
  const { name, username } = req.body;
  const email = req.email;
  try {
    const room = await Room.findOne({ name });
    const data = room.waiting.find(prev => prev.username === username);
    const hod = await Hod.findOne({ email });
    hod.notifications.filter(prev => prev.username !== username)
    room.isAvailable = false;
    room.allocatedTime = data?.allocatedTime;
    room.waiting.filter(prev => prev.username !== username);
    room.approvedBy = email;
    room.bookedBy = data?.email;
    room.reason = data?.reason;
    await scheduler(room, data?.allocatedTimeio, io);
    io.emit('booked', { data: result.data })
    res.json({ message: 'Success', room: result.data });
  } catch (error) {
    res.json({ message: error.message })
  }
});

router.post('/reject/booking', isHod, async (req, res) => {
   const { username, name, email: usermail } = req.body;
   const email = req.email;
   try {
    const room = await Room.findOne({ name });
    room?.waiting?.filter(user => user.username !== username)
    await room.save();
    const hod = await Hod.findOne({ email });
    hod.notifications = hod.notifications.filter(prev => {
      console.log(prev)
      return prev.email !== usermail
    })
    await hod.save();
    res.json({ message: 'Success', data: hod });
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.post('/request/booking', isUser, async (req, res) => {
  const { from, to, name, reason } = req.body;
  const { email, department } = req.staff;
  try {
    const staff = await Staff.findOne({ email });
    const allocatedTime = format(from, to);
    const data = { allocatedTime, name, reason, email };
    const room = await Room.findOne({ name });
    room.waiting.push({ email, allocatedTime });
    const hod = await Hod.findOne({ department });
    hod.notifications.push({ ...data, image: staff.image, username: staff.name});
    await hod.save();
    await room.save();
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
    await room.save();
    io.emit('booked', { data: room })
    res.status(200).json({ message: 'Success', data: room });
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.get('/get-booked', isUser, async (req, res) => {
  const { email, role } = req.staff;
  try {
    if (role === 'hod') {
      const data = await Room.find({ approvedBy: email });
      const notifications = await Hod.findOne({ email });
      res.json({ message: 'Success', data, notifications: notifications.notifications.length })
    } else {
      const data = await Room.find({ bookedBy: email });
      res.json({ message: 'Success', data });
    }
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.get('/notifications', isHod, async (req, res) => {
  const email = req.email;
  try {
    const data = await Hod.findOne({ email });
    res.json({ message: 'Success', data: data.notifications })
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.post('/cancel', isUser, async (req, res) => {
  const { email } = req.staff;
  const { id } = req.body;
  try {
    const room = await Room.findById(id);
    if (room.bookedBy !== email) {
      return res.json({ message: 'You Are Not Authorized' });
    }
    room.isAvailable = true;
    room.bookedBy = '';
    room.approvedBy = '';
    room.allocatedTime = '';
    room.reason = '';
    room.waiting = [];
    await room.save();
    res.json({ message: 'Success', data: room });
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.get('/hod/notifications', isHod,async (req, res) => {
  const id = req.id;
  try {
    const notifications = await Hod.findById(id).select({ notifications: 1 });
    res.json({ message: 'Success', data: notifications.notifications });
  } catch (error) {
    res.json({ message: error.message });
  }
})

module.exports = router;