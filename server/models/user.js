const mongoose = require('mongoose');

const User = mongoose.model('User', {
    username: {type: String, required: true, minLength: 1},
    email: {type: String, required: true, minLength: 1},
    password: {type: String, required: true, minLength: 6},
    chats: {type: Array},
    active: {type: Boolean, required: true, default: false},
    salt: {type: String}
});

module.exports = User;