const { Schema, model } = require('mongoose');
const scheduler = require('node-schedule');
const { Event } = require('../server')

const RoomSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Room Name Is Required']
  },
  floor: {
    type: Number,
    required: [true, 'Floor No. Is Required']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  allocatedTime: {
    type: String,
    default: null
  },
  bookedBy: {
    type: String,
    default: null
  },
  isMaintenanceRequired: {
    type: Boolean,
    default: false
  },
  reason: {
    type: String,
    default: ''
  },
  approvedBy: {
    type: String,
    default: false
  },
  waiting: {
    type: [Object],
    default: []
  }
});

RoomSchema.methods.AddScheduler = function(to) {
  console.log(to);
  scheduler.scheduleJob(
    { ...to, tz: 'Asia/Kolkata' }, 
    async () => {
    this.isAvailable = true;
    this.allocatedTime = null;
    this.bookedBy = null;
    this.reason = '';
    this.approvedBy = '',
    this.isMaintenanceRequired = false
    console.log('hi da');
    await this.save();
    Event.emit('free', { id: this.id })
  });
}

module.exports = model('Room', RoomSchema);