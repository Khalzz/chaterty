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
        socket.on('joinChat', async (data) => {
            if (data.lastChat != null) {
                socket.leave(data.lastChat);
            }
            socket.join(data.id);
            const auth = jwt.verify(socket.handshake.auth.token, process.env.SECRET);
            socket.join(auth._id);
            const user = await Users.findById(auth._id)
            const fixedChats = user.chats.map((chatUser) => {
                if (chatUser.id == data.id) {
                    return {id: chatUser.id, readed: true}
                }
                return chatUser
            })
            user.chats = fixedChats;
            user.save();
            socket.leave(auth._id);
        })

        socket.on('joinGlobal', async () => {
            const user = await getUser();
            socket.join(user._id.toString());
        })

        socket.on('loadMessages', async (data) => {
            try {
                const chat = await Chats.findById(data.id);
                io.to(data.id).emit('listed-messages',chat.messages);
            } catch (error) {
                console.log(error)
            }
        });

        socket.on('leaveChat', async (data) => {
            console.log(data._id)
            socket.leave(data._id);
        })

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
                    sender: auth._id,
                }


                let otherUser;
    
                chat.users.forEach(element => {
                    if (element.toString() != auth._id) {
                        otherUser = element.toString();
                    }
                });

                const otherUserObject = await Users.findById(otherUser);
                const fixedChats = otherUserObject.chats.map((chatUser) => {
                    if (chatUser.id == chat.id) {
                        console.log(chatUser.id)
                        console.log(chat.id)
                        return {id: chatUser.id, readed: false}
                    }
                    return chatUser
                })

                console.log(fixedChats)

                otherUserObject.chats = fixedChats;
                await otherUserObject.save();
                socket.join(otherUser);
                io.to(otherUser).emit('reloadContacts');
                socket.leave(otherUser);
                chat.messages.push(message);
                await chat.save();
                io.to(data.chatId).emit('update');
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
                io.to(data.id).emit('update');
            } catch (err) {
                console.log(err)
            }     
        })

        const getFixedChats = (user, id) => {
            return user.chats.flatMap((chatId) => {
                if (chatId.id == id) {
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
                let thisUser;
                let otherUser;
                chat.users.forEach(element => {
                    if (element.toString() != data.user) {
                        otherUser = element.toString();
                    } else {
                        thisUser = element.toString();
                    }
                });
                socket.join(otherUser);
                io.to(otherUser).emit('reloadContacts');
                socket.leave(otherUser);
                io.to(id).emit('reload');
                socket.leave(id)
            } catch (error) {
                console.log(error)
            }
        })

        const getUser = async () => {
            try {
                const auth = jwt.verify(socket.handshake.auth.token, process.env.SECRET);
                if (auth._id == undefined) {
                    throw new Error('auth not sended');
                }
                const user = await Users.findById(auth._id);
                if (!user) {
                    throw new Error('not authenticated');
                }
                return user;
            } catch (error) {
                console.log(error.message)
            }
        }

        socket.on('getContacts', async (data) => {
            try {
                const chats = await Chats.find();
                const user = await getUser();
                if (!user) {
                    return res.status(401).send('There was an error');
                }
    
                const ChatsList = user.chats.flatMap((chatId) => {
                    return chats.flatMap(chat => {
                        if (chatId.id == chat._id) {
                            return {
                                _id: chat._id,
                                users: chat.users,
                                messages: chat.messages,
                                isReaded: chatId.readed
                            };
                        }
                        return [];
                    });
                });
    
                const FixedChatsList = await Promise.all(ChatsList.map(async (chat) => {
                    let otherUser;
    
                    chat.users.forEach(element => {
                        if (element.toString() != user._id.toString()) {
                            otherUser = element;
                        }
                    });
    
                    const finalUser = await Users.findById(otherUser);
                    const finalChat = {
                        id: chat._id,
                        name: finalUser.username,
                        readed: chat.isReaded
                    }
                    return finalChat
                }));
                io.to(user._id.toString()).emit('loadContacts', FixedChatsList);
            } catch (error) {
                console.log(error.message)
            }
        })

        const checkVariations = async (list) => {
            for (let i in list) {
                const check = await Chats.findById(list[i]);
                if (check) {
                    return true;
                }
            }
            return false;
        }

        socket.on('createContact', async (data) => {
            try {
                // first check if the users exist, then we create a new chat with them
                const firstUser = await getUser();
                const secondUser = await Users.findOne({username: data.username});

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
    
                firstUser.chats.push({id: newChat._id, readed: true})
                await firstUser.save();
                secondUser.chats.push({id: newChat._id, readed: true})
                await secondUser.save();
                
                const chat = new Chats(newChat);
                const savedChat = await chat.save();
                io.to(firstUser._id.toString()).emit('reload');
                socket.join(secondUser._id.toString());
                io.to(secondUser._id.toString()).emit('reloadContacts');
                socket.leave(secondUser._id.toString());
            } catch(e) {
                console.log(e)
                io.to(getUser()._id).emit('createLog', {status: 400, message: e.message});
            } 
        })
    })
}