'use strict';

const express = require('express');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const Url = require('./urlShortenerController.js').UrlModel;
const createUrl = require('./urlShortenerController.js').createUrl;
const findByShortUrl = require('./urlShortenerController.js').findByShortUrl;
const dns = require('dns');

// Basic Configuration 
var port = process.env.PORT || 3000;

var app = express();

app.use(cors());

// Error handler
app.use(function(err, req, res, next) {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }
});

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGO_URI);

// URL to check mongodb connection status
app.get('/is-mongoose-ok', function(req, res) {
  if (mongoose) {
    res.json({isMongooseOk: !!mongoose.connection.readyState})
  } else {
    res.json({isMongooseOk: false})
  }
});

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: 'false'}));
app.use(bodyParser.json());


app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// API endpoints 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

// User stories 1 & 2
app.post("/api/shorturl/new", function(req, res) {
  const url = req.body.url;
  let lookUpUrl = url.replace(/^https?:\/\//i, "");
  lookUpUrl = lookUpUrl.replace(/\/.+/, "");

  dns.lookup(lookUpUrl, function (err, addresses, family) {
    if (url.match(/^https?:\/\//i) && addresses) {
      createUrl(url, function(err, data) {
        res.json({ original_url: data.originalUrl, short_url: data.shortUrl });
      });
    } else {
      res.json({ "error": "invalid URL" });
    }
  });

});

// User story 3
app.get("/api/shorturl/:url", function(req, res) {
  findByShortUrl(req.params.url, function(err, data) {
    if (data) {
      res.status(301).redirect(data.originalUrl);
    } else {
      res.json({ "error": "invalid short URL or original URL not yet shortened" });
    }
  });
});
// END endpoints

app.listen(port, function () {
  console.log('Node.js listening ...');
});
