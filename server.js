require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const shortId= require('shortid');
var isUrl= require('is-url');
var bodyParser = require('body-parser');
const shortid = require('shortid');

//var urlencodedParser = bodyParser.urlencoded({ extended: false })
main().catch(err => console.log(err));
async function main(){
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('connected to MongoDB');
};

const urlSchema = new mongoose.Schema({
  orgUrl:String,
  shortUrl:String
});
const URL = mongoose.model('URL', urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.post('/api/shorturl', async (req,res)=>{
  const newUrl = req.body.url;
  const shortenedUrl= shortId.generate();
  console.log(isUrl(newUrl));
  

  if (!isUrl(newUrl)){
    res.json({error:'invalid url'});
  } else {
    try{
      let findOne = await URL.findOne({orjUrl:newUrl})
      if(findOne) res.json({original_url:findOne.orgUrl, short_url:findOne.shortUrl});
      else {
        findOne= new URL({orgUrl:newUrl,shortUrl:shortenedUrl});
        await findOne.save();
        res.json({original_url:newUrl,short_url:shortenedUrl});
      }
    }
    catch(err){
      console.log(err);
      res.json({error:'server error'});
    }
  }
  
});

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});
app.get('/api/shorturl/:shorturl', async (req,res)=>{
  try {
    const findOne = await URL.findOne({shortUrl:req.params.shorturl});
    
    if(findOne){
      console.log('found');
      res.redirect(findOne.orgUrl);
    } else res.json({error:'no URL found'});
  } catch(err){
    console.log('no such short URL');
    res.json({error:'no such short URL'});
  }
});
// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
