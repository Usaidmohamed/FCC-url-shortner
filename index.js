require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const urlParser = require('url');
const dns = require('dns');
const { getuid } = require('process');
const { get } = require('express/lib/response');
const {Schema} = mongoose;
const app = express();

//Connecting the database
mongoose.connect(process.env.MONGO_URL);

const UrlSchema = new Schema({
  original_url: String,
  short_url: Number
});
const URL = mongoose.model('URL', UrlSchema);

// Basic Configuration
const port = process.env.PORT;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  const url = req.body.url;
  const dnslookup = dns.lookup(urlParser.parse(url).hostname,
  async (err, address) =>{
    if(!address){
      res.json({error: 'Invalid url'});
    }else{
      const urlCount = await URL.countDocuments({});
      const addUrl = new URL({
        original_url: url,
        short_url: urlCount
      });
      await addUrl.save();
      res.json({original_url: url, short_url: urlCount});
    }
  });
});

//GET API to retrieve URL
app.get('/api/shorturl/:short_url', async (req, res) =>{
  const shorturl = req.params.short_url;
  const getUrl = await URL.findOne({short_url: +shorturl});
  if(!getUrl){
    res.json({error: 'URL not found'});
  }
  res.redirect(getUrl.original_url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
