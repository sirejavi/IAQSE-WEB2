// server.js
// load the things we need
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
app.use(bodyParser.text({ type: 'text/html', defaultCharset: "iso-8859-1" }));

app.use((req, res, next) => { //change app.all to app.use here and remove '*', i.e. the first parameter part
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type,X-Requested-With");
  res.set("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  if(req.originalUrl.endsWith(".html")) {
    res.set("Content-Type", "text/html; charset=iso-8859-1");
  } else if(req.originalUrl.endsWith(".svg")) {
    res.set("Content-Type", "text/xml; charset=iso-8859-1");
  }
  next();
});

// static server 
app.use('/', express.static('static'));

app.listen(3000);
console.log('Application server running on port 3000');
