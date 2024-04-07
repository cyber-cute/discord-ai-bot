const mongoose = require('mongoose');

const premiumCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    used: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('PremiumCode', premiumCodeSchema);