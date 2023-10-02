const express = require('express');
const router = express.Router();
const Hod = require('../models/hod');
const Room = require('../models/room');
const Allowed = require('../models/allowed')
const { isAdmin } = require('../middlewares/admin');

router.post('/create/hod', isAdmin, async(req, res) => {
  const { email, role, department  } = req.body;
  try {
    const user = await Allowed.findOne({ email });
    if (!user) {
      const newUser = await Allowed.create({ email, role, department });
      return res.status(200).json({ message: 'Success', data: newUser });
    } else {
      return res.status(203).json({ message: 'User Already Exists' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/create/room', isAdmin, async(req, res) => {
  const { name, floor } = req.body;
  try {
    const room = await Room.findOne({ name });
    if (!room) {
      const newRoom = await Room.create({ name, floor });
      res.status(200).json({ message: 'Success', data: newRoom });
    } else {
      res.status(203).json({ message: 'Room Already Exists' });
    }
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.get('/initial/rooms', async (req, res) => {
  try {
    const room = await Room
      .find({})
      res.json({ data: room, message: "Success" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await Allowed.find({ role: 'hod' });
    res.status(200).json({ message: 'Success', data: users });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
})

module.exports = router;