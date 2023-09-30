const { Schema, model } = require('mongoose');

const allowedSchema = new Schema({
  email: {
    type: String
  },
  role: {
    type: String
  },
  department: {
    type: String
  }
});

module.exports = model('AllowedUsers', allowedSchema);