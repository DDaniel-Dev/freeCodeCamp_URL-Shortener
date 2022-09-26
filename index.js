// -- http://localhost:3000/ -- //

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const dns = require('dns');
const urlparser = require('url');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});


// Database Connection //
const uri = process.env.MONGO_URI
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

const urlSchema = new mongoose.Schema({
  url : String
});

const Url = mongoose.model("URL", urlSchema);

// -- Set-up POST request for /api/shorturl -- //
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/api/shorturl", async function(req, res) {
  console.log(req.body);
  const bodyURL = req.body.url;
  
  const something = dns.lookup(urlparser.parse(bodyURL).hostname, 
  (err, address) => {
    if (!address) {
      res.json({ error: "Invalid URL" })
    } else {
      const url = new Url({ url: bodyURL })
      url.save((err, data) => {
        res.json({
          original_url: data.url,
          short_url: data.id
        })
      })
    };
    console.log("dns", err);
    console.log("address", address);
  })
  console.log("something", something);
});

// -- Set-up GET request for /api/shorturl/:id -- //
app.get("/api/shorturl/:id", (req, res) => {
  const id = req.params.id;
  Url.findById(id, (err, data) => {
    if (!data) {
      res.json({ error: "Invalid URL" })
    } else {
      res.redirect(data.url)
    }
  });
});
