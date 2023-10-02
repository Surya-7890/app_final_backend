const { Schema, model } = require('mongoose');

const AdminSchema = new Schema({
  username: {
    type: String
  },
  password: {
    type: String
  }
});

module.exports = model('admin', AdminSchema);