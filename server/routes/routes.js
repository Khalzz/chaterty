const { User, authenticated, validateJwt  } = require('../routes/controllers/user-controller');
const Chat = require('../routes/controllers/chat-controller');

const express = require('express');
const router = express.Router();

// user auth and edit
router.post('/Login', User.login);
router.post('/Register', User.register);
router.patch('/UserEdit/:id', authenticated, User.edit);
router.get('/User', authenticated, User.getThis);
router.get('/Users', authenticated, User.list);
router.get('/Users:username', authenticated, User.listOne);
router.patch('/Edit', authenticated, User.edit);

// chat crud
router.get('/Chats', authenticated, Chat.list);
router.post('/ThisChat', authenticated, Chat.listOne);
router.post('/Chat', authenticated, Chat.create);

module.exports = router;
