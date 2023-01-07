const Users = require('./server/models/user')
const Chats = require('./server/models/chat')
const jwt = require('jsonwebtoken');

module.exports = (io) => {
    io.use(async (socket, next) => {
        try {
            const auth = jwt.verify(socket.handshake.auth.token, process.env.SECRET);
            if (auth._id == undefined) {
                throw new Error('auth not sended');
            }
            const user = await Users.findById(auth._id);
            if (!user) {
                throw new Error('not authenticated');
            }
            next();
        } catch (error) {
            next(error.message);
        }
    });
    io.on('connection', (socket) => {
        console.log('client connected');

        socket.on('loadMessages', async (data) => {
            try {
                const chat = await Chats.findById(data.id);
                io.emit('listed-messages',chat.messages);
            } catch (error) {
                console.log(error)
            }
        });

        socket.on('sendMessage', async (data) => {
            try {
                const auth = jwt.verify(socket.handshake.auth.token, process.env.SECRET);
                const chat = await Chats.findById(data.chatId);
                if (!chat) {
                    throw new Error('this chat dont exists');
                }
                
                const message = {
                    text: data.text,
                    hour: data.hour,
                    sender: auth._id
                }
    
                chat.messages.push(message);
                await chat.save();
                io.emit('update');
            } catch (err) {
                console.log(err)
            }     
        });

        socket.on('clearChats', async (data) => {
            try {
                const chat = await Chats.findById(data.id);

                if (!chat) {
                    throw new Error('this chat dont exists')
                }
                
                chat.messages = [];
                await chat.save();
                io.emit('update');
            } catch (err) {
                console.log(err)
            }     
        })

        const getFixedChats = (user, id) => {
            return user.chats.flatMap((chatId) => {
                if (chatId == id) {
                    return []
                } else {
                    return chatId
                }
            })
        }

        socket.on('deleteChat', async (data) => {
            try {
                const id  = data._id;
                const chat = await Chats.findOne({ _id: id});
                const user = await Users.findById(chat.users[0]);
                const user1 = await Users.findById(chat.users[1]);
                user.chats = getFixedChats(user, id);
                user1.chats = getFixedChats(user1, id);
                await user.save();
                await user1.save();

                if (chat) { 
                    chat.remove();
                }

                io.emit('reload');
            } catch (error) {
                console.log(error)
            }
        })
    })
    
}