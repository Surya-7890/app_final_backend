const { Schema, model } = require('mongoose');

const hodSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name Is Required']
  },
  email: {
    type: String,
    required: [true, 'Email Is Required']
  },
  department: {
    type: String,
    required: [true, 'Department Is Required']
  },
  googleId: {
    type: String,
    required: [true, 'GoogleId Is Required']
  },
  image: {
    type: String,
    required: [true, 'Image Is Required']
  },
  notifications: {
    type: Array,
    default: []
  }
});

module.exports = model('Hod', hodSchema);