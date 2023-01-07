require('dotenv').config();

const path = require('path');

const sockets = require('./sockets');
const mongoose = require('mongoose');
const express = require('express');
const app = express();

// web sockets
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const port = process.env.PORT || 3000;

app.use(express.json());

mongoose.set('strictQuery', true); // for some reason mongoose need this now (study why)
mongoose.connect(process.env.DB);

app.use('', require('./server/routes/routes'));
app.use(express.static(path.join(__dirname, './client/static')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './client/views/index.html'));
});

sockets(io, app);

const httpServer = server.listen(port, () => {
    console.log(`The server is Running on the port http://localhost:${port}`);
});