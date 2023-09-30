const express = require('express');
const app = express();

/**
 * 
 * created an http server, so as to use socket io with this
 * 
 */
const server = require('http').createServer(app);
const { Server } = require('socket.io');


const cors = require('cors');
const passport = require('passport');
require('dotenv').config()
const mongoose = require('mongoose');
const { EventEmitter } = require('events');
const io = new Server(server, { cors: { origin: '*' } });

require('./auth/passport');

/**
 * 
 * importing different routes
 */

const AuthRouter = require('./routes/auth');
const RoomRouter = require('./routes/room');



/**
 * 
 * An event emitter to listen for events and emit socket.io events
 * to the clients listening 
 */

const Event = new EventEmitter();
Event.addListener('free', (id) => io.emit('free', id))
Event.addListener('booked', (data) => io.emit('booked', data))

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: '*' }));
app.use('/auth', AuthRouter);
app.use('/rooms', RoomRouter);
app.use(passport.initialize());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('connected to dabase'))
  .catch((err) => console.error(err));

server.listen(process.env.PORT);

module.exports = { Event }