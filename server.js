'use strict';

let express = require('express');
let mongo = require('mongodb');
let mongoose = require('mongoose');
let dns = require('dns');

let cors = require('cors');

const app = express();

// Basic Configuration 
const port = process.env.PORT || 3000;

process.env.MONGO_URI='mongodb+srv://juliemoy:jmmj%21975JAM@cluster0-ye1vt.mongodb.net/test?retryWrites=true&w=majority';
mongoose.connect(process.env.MONGO_URI);


app.use(cors());

const shortUrls = []
for(let i = 1; i <=500; i++) {
  shortUrls.push(i);
}


/** this project needs to parse POST bodies **/
// you should mount the body-parser here
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});

//create url schema
let urlSchema = new mongoose.Schema({
  longUrl: {
    type: String
  },
  shortUrl: {
    type: Number
  }
});
let url_model = mongoose.model('url_model', urlSchema);


let new_url = new url_model({
  longUrl: "www.google.com",
  shortUrl: 501
});
console.log('trying to save')
new_url.save((err, data) => {
  if (err) return console.log("there was an error saving");
  console.log('new_url saved.');
});

app.post('/api/shorturl/new', (req, res) => {
  const long_url = req.body.url.slice(8);
  
  dns.lookup(long_url, (err, address, family) => {
    if(err) {
      res.json({error: "invalid URL"});
    }else{      
  
  
  let short_url = shortUrls.shift();
  console.log(short_url);
  shortUrls.push(shortUrls[shortUrls.length-1]+1);
  
  let url_doc = new url_model({
    longUrl: long_url,
    shortUrl: short_url
  });
  url_doc.save((err, data) =>{
    if(err) return console.log("there was an error saving the url");
    console.log("doc url saved.");
  });
  res.json({original_url: url_doc.longUrl, short_url: url_doc.shortUrl});
    }
    });
});
  
app.get('/api/shorturl/:surl', (req,res) => {
  let lookup_surl = parseInt(req.params.surl);
  console.log(`looking up surl ${lookup_surl}`);
  url_model.findOne({shortUrl: lookup_surl}, (err,data) => {
    if(err) return;
    if(data) {
      res.redirect(`https://${data.longUrl}`);
    } else {
      res.json({error: "no short url found"})
    }
  });
  
})
