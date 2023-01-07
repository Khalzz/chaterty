const mongoose = require('mongoose');

const Chat = mongoose.model('Chat', {
    _id: {type: String},
    users: {type: Array},
    messages: {type: Array}
});

module.exports = Chat;