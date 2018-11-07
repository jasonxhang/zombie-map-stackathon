'use strict';

const express = require('express');
const path = require('path');
const volleyball = require('volleyball');

const session = require('express-session');

const app = express();

// logging middleware
app.use(volleyball);

// body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use(session({
  secret: process.env.SESSION_SECRET || 'a wildly insecure secret',
  resave: false,
  saveUninitialized: false
}));





// static middleware
app.use(express.static(path.join(__dirname, '../public')));

// app.use('/api', require('./api')) // include our routes!

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
}); // Send index.html for any other requests




// error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || 'Internal server error');
});

const PORT = 1337

app.listen(PORT, () =>
  console.log(`studiously serving silly sounds on port ${PORT}`)
);

module.exports = app;
