const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  discordId: {
    type: String,
    required: true,
    unique: true
  },
  dailyImageLimit: {
    type: Number,
    default: 3
  },
  lastImageCreated: {
    type: Date,
    default: Date.now
  },
  premium: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('AiUser', UserSchema);