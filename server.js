const express = require('express');
const cors = require('cors');
const dns = require('dns');
const urlParser = require('url');
const app = express();

app.use(cors({ optionsSuccessStatus: status => 200 }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));

app.get("/", function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

const urlDatabase = {};
let idCounter = 1;

app.post("/api/shorturl", function(req, res) {
  const originalUrl = req.body.url;
  
  const parsedUrl = urlParser.parse(originalUrl);
  if (!parsedUrl.hostname) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(parsedUrl.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }
    
    urlDatabase[idCounter] = originalUrl;
    res.json({ original_url: originalUrl, short_url: idCounter });
    idCounter++;
  });
});

app.get("/api/shorturl/:short_url", function(req, res) {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];
  
  if (originalUrl) {
    return res.redirect(originalUrl);
  } else {
    return res.json({ error: 'No short URL found for the given input' });
  }
});

const listener = app.listen(process.env.PORT || 3000, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});