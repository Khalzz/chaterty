const Chats = require('../../models/chat');
const Users = require('../../models/user');

const checkVariations = async (list) => {
    for (let i in list) {
        const check = await Chats.findById(list[i]);
        if (check) {
            return true;
        }
    }
    return false;
}

const Chat = {
    list: async (req,res) => {
        try {
            const thisId = req.auth._id;
            const chats = await Chats.find();
            const user = await Users.findById(thisId);

            if (!user) {
                return res.status(401).send('There was an error');
            }

            const ChatsList = user.chats.flatMap((chatId) => {
                return chats.flatMap(chat => {
                    if (chatId == chat._id) {
                        return chat;
                    }
                    return [];
                });
            });

            const FixedChatsList = await Promise.all(ChatsList.map(async (chat) => {
                let otherUser;

                chat.users.forEach(element => {
                    if (element != thisId) {
                        otherUser = element;
                    }
                });

                const finalUser = await Users.findById(otherUser);
                const finalChat = {
                    id: chat._id,
                    name: finalUser.username
                }

                return finalChat
            }))
            res.status(201).send(FixedChatsList);
        } catch (error) {
            res.status(401).send('There was an error' + error);
        }
    },
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
    create: async (req,res) => {
        try {
            // first check if the users exist, then we create a new chat with them
            const firstUser = await Users.findById(req.auth._id);
            const secondUser = await Users.findOne({username: req.body.username});

            if (!secondUser) {
                throw new Error('This user dont exists');
            }

            const users = [firstUser._id, secondUser._id]

            const chatVariations = [
                users[0] + users[1],
                users[1] + users[0]
            ];

            if (await checkVariations(chatVariations)) {
                throw new Error('This chat already exists');
            }
            if (chatVariations[0] == users[0] + users[0]) {
                throw new Error('You cant talk with yourself');
            }

            const newChat = {
                _id: users[0]+users[1],
                users: users,
                messages: []
            }
      
            firstUser.chats.push(newChat._id)
            await firstUser.save();
            secondUser.chats.push(newChat._id)
            await secondUser.save();

            const chat = new Chats(newChat);
            const savedChat = await chat.save();
            res.status(201).send(savedChat._id);
        } catch(e) {
            res.status(400).send(`Something went wrong!!!: ${e}`); 
        } 
    }
}

module.exports = Chat;