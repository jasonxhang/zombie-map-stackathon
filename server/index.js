'use strict';

const express = require('express');
const path = require('path');
const volleyball = require('volleyball');
const session = require('express-session');
const app = express();
const socketio = require('socket.io');
const getDataAndEmit = require('./util.js')
// module.exports = app;

const createApp = () => {
  // logging middleware
  app.use(volleyball);

  // body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'a wildly insecure secret',
      resave: false,
      saveUninitialized: false,
    })
  );

  // static middleware
  app.use(express.static(path.join(__dirname, '../public')));

  app.get('/api/bus', (req, res, next) => {
    const requestSettings = {
      method: 'GET',
      url:
        'http://gtfsrt.prod.obanyc.com/vehiclePositions?key=93ee96e13d28cf5c3b594e8ac5ec6752',
      encoding: null,
    };

    request(requestSettings, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        var feed = GtfsRealtimeBindings.FeedMessage.decode(body);

        let array = [];
        feed.entity.forEach(function(entity) {
          if (entity.id) {
            // console.log('id', entity.id);
            // console.log('vehicle info', entity.vehicle)
            array.push(entity.vehicle);
          }
        });
        res.status(200).json(array);
      }
    });
  });

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  }); // Send index.html for any other requests

  // error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).send(err.message || 'Internal server error');
  });
};


const startListening = () => {
  // start listening (and create a 'server' object representing our server)
  const PORT = 1337;
  const server = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
  let interval;
  // set up our socket control center
  const io = socketio(server);
  io.on('connection', socket => {
    console.log(
      `A socket connection to the server has been made: ${socket.id}!!!!`
    );

    if (interval) {
      clearInterval(interval);
    }

    interval = setInterval(() => getDataAndEmit(socket), 2000);

    socket.on('disconnect', () => {
      console.log(`Connection ${socket.id} has left the building`);
    });
  });
};

async function bootApp() {
  // await sessionStore.sync()
  // await syncDb()
  await createApp();
  await startListening();
}
// This evaluates as true when this file is run directly from the command line,
// i.e. when we say 'node server/index.js' (or 'nodemon server/index.js', or 'nodemon server', etc)
// It will evaluate false when this module is required by another module - for example,
// if we wanted to require our app in a test spec
if (require.main === module) {
  bootApp();
} else {
  createApp();
}
