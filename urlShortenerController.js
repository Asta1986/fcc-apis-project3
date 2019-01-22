'use strict';

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.connect(process.env.MONGO_URI);


const schema = new Schema({
    originalUrl: { type: String, required: true },
    shortUrl: { type: Number, required: true },
});

const Url = mongoose.model('Url', schema);


const maxIndexUrl = () => {
  return Url
          .findOne()
          .sort('-shortUrl')
          .exec();
}

const findOriginalUrl = (url) => {
  return Url
          .findOne({ originalUrl: url })
          .exec();
}

const findShortUrl = (url) => {
  return Url
          .findOne({ shortUrl: url })
          .exec();
}

async function createAndSaveUrl(url, done) {
  try {
    const maxIndUrl = await maxIndexUrl();

    var maxInd;
    if (maxIndUrl === null) {
      maxInd = 0;
    } else {
      maxInd = maxIndUrl.shortUrl + 1;
    }

    const newUrl = new Url({ originalUrl: url, shortUrl: maxInd });
    newUrl.save(function(err, data) {
      if(err) {
        return done(err) 
      };
      done(null, data);
    });
  } catch (err) {
    console.log(err); 
  }
};

async function createUrl(url, done) {
  try {
    const foundUrl = await findOriginalUrl(url);

    if (foundUrl === null) {
      createAndSaveUrl(url, done);
    } else {
      done(null, foundUrl);  
    }
  } catch (err) {
    console.log(err); 
  }
}

async function findByShortUrl(url, done) {
  try {
    const foundUrl = await findShortUrl(url);
    done(null, foundUrl);
  } catch (err) {
    console.log(err); 
  }
}

exports.UrlModel = Url;
exports.findByShortUrl = findByShortUrl;
exports.createUrl = createUrl;
