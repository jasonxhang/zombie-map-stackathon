'use strict';

const express = require('express');
const path = require('path');
const volleyball = require('volleyball');
const session = require('express-session');
var GtfsRealtimeBindings = require('gtfs-realtime-bindings');
var request = require('request');


const app = express();

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

// app.use('/restbus', restbus.middleware());


// app.use('/api', require('./api')) // include our routes!

app.get('/api/bus', (req, res, next) => {

  var requestSettings = {
    method: 'GET',
    url: 'http://gtfsrt.prod.obanyc.com/vehiclePositions?key=93ee96e13d28cf5c3b594e8ac5ec6752',
    encoding: null
  };

  request(requestSettings, function (error, response, body) {


    if (!error && response.statusCode == 200) {
      var feed = GtfsRealtimeBindings.FeedMessage.decode(body);

      let array = []
      feed.entity.forEach(function(entity) {
        if (entity.id) {
          // console.log('id', entity.id);
          // console.log('vehicle info', entity.vehicle)
          array.push(entity.vehicle)
        }
      });
      res.status(200).json(array)
    }
  });

})




app.get('/api/all', (req, res, next) => {

  var requestSettings = {
    method: 'GET',
    url: 'http://gtfsrt.prod.obanyc.com/tripUpdates?key=93ee96e13d28cf5c3b594e8ac5ec6752',
    encoding: null
  };

  request(requestSettings, function (error, response, body) {


    if (!error && response.statusCode == 200) {
      var feed = GtfsRealtimeBindings.FeedMessage.decode(body);

      let array = []
      feed.entity.forEach(function(entity) {
        if (entity.id) {
          // console.log('id', entity.id);
          // console.log('vehicle info', entity.vehicle)
          array.push(entity.vehicle)
        }
      });
      res.status(200).json(array)
    }
  });

})







app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
}); // Send index.html for any other requests



// error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || 'Internal server error');
});

const PORT = 1337;

app.listen(PORT, () => {
  console.log(`studiously serving silly sounds on port ${PORT}`);
});

module.exports = app;
