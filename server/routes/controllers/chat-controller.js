const Chats = require('../../models/chat');
const Users = require('../../models/user');

const Chat = {
    listOne: async (req,res) => {
        try {
            const chat = await Chats.findById(req.body.id);
            if (!chat) {
                throw new Error('This chat dont exists');
            }

            res.status(201).send(chat);
        }
        catch (error) {
            res.status(400).send(`There was an error: ${error}`);
        }
    },
}

module.exports = Chat;