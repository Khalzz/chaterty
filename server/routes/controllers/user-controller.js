const Users = require('../../models/user');
const Chats = require('../../models/chat');

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {expressjwt: expJwt} = require("express-jwt");   

const signToken = _id => jwt.sign({ _id }, process.env.SECRET);

const User = {
    login: async (req,res) => {
        const { body } = req;

        try {
            const user = await Users.findOne({ username: body.username });
            if (!user) {
                res.status(401).send('Username or password is incorrect!!!');
            } else {
                const isMatch = await bcrypt.compare(body.password, user.password) 
                if (isMatch) {
                    const signed = signToken(user._id);
                    res.status(200).send(signed)
                } else {
                    res.status(403).send('Username or password is incorrect!!!')
                }
            }
        } catch (error) {
            res.status(500).send(error.message);
        }
    },
    register: async (req,res) => {
        const { body } = req;
        try {
            const isUser = await Users.findOne({ username: body.username });
            if (isUser) {
                res.status(401).send('This user already exists');
            }

            const salt = await bcrypt.genSalt();
            const hashed = await bcrypt.hash(body.password, salt);

            if (req.body.password.length <= 6) {
                return res.status(500).send('the password needs to be longer');
            }

            // remember goofy ass rodrigo, you have to add here what values you want to add
            const user = await Users.create({ 
                                                identifier: body.identifier,
                                                username:body.username, 
                                                password:hashed,
                                                active: false,
                                                salt
                                            });

            const signed = signToken(user._id);
            res.status(201).send(signed);
        } catch (err) {
            res.status(500).send(err.message);
        }
    },
    getThis: async (req, res) => {
        try {
            const user = await Users.findById(req.auth._id);
            const publicData = {
                id: user._id,
                username: user.username
            }
            res.send(publicData);
        } catch (err){
            res.status(500).send(err.message)
        }
    },
    edit: async (req, res) => {
        try {
            const user = await Users.findById(req.auth._id);
            const newUsername = await Users.findOne({ username: req.body.username });

            if (newUsername) {
                return res.status(400).send('This username is already in use');
            }

            if (req.body.username != undefined) {
                if (req.body.username.length <= 3) {
                    return res.status(400).send('The username needs a length of more than 3 characters');
                }
                if (req.body.username == user.username) {
                    return res.status(400).send('The username has to be different than the last one');
                }
                user.username = req.body.username;
            }
            if (req.body.newChat != undefined) {
                const chat = await Chats.findById(req.body.newChat);
            }
            await user.save();
            res.status(204).send('User edited successfully');
        } catch (err) {
            res.status(500).send(err.message)
        }     
    },
    listOne: async (req, res) => {
        try {
            const user = await Users.findOne({username: req.body.username});
            const publicData = {
                id: user._id,
                username: user.username
            };
            res.status(204).send(publicData);
        } catch (err) {
            res.status(500).send(err.message);
        }

    },
    list: async (req, res) => {
        const users = await Users.find();
        const allButThis = users.flatMap((user) => { // flatmap dont adds nothing to the result if we return a empty array
            if (user._id != req.auth._id) {
                return user;
            }
            return [];
        })
        res.status(200).send(allButThis);
    },
}

const  validateJwt = expJwt({secret: process.env.SECRET, algorithms: ['HS256'] });

const findAndAssignUser = async (req, res, next) => {
    try {
        const user = await Users.findById(req.auth._id);
        if (!user) {
            return res.status(401).end();
        }
        req.user = user;
        next();
    } catch (e) {
        next(e);
    }
}

const authenticated = express.Router().use(validateJwt, findAndAssignUser); // joining middlewares

module.exports = { User, authenticated, validateJwt };