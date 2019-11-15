// server.js
// load the things we need
const bodyParser = require('body-parser');
const express = require('express');
const fs = require("fs");
const app = express();

app.use(bodyParser.text({ type: 'text/html', defaultCharset: "iso-8859-1" }));

app.use((req, res, next) => { //change app.all to app.use here and remove '*', i.e. the first parameter part
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type,X-Requested-With");
  res.set("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  if(req.originalUrl.endsWith(".html")) {
    res.set("Content-Type", "text/html; charset=iso-8859-1");
  } else if(req.originalUrl.endsWith(".svg")) {
    res.set("Content-Type", "text/xml; charset=iso-8859-1");
  } else if(req.originalUrl.endsWith(".json")) {
    res.set("Content-Type", "application/json; charset=iso-8859-1");
  }
  next();
});


app.use('/database/:schema', function (req, res, next) {
  
  const json = require('./database/'+req.params.schema);
  res.send(JSON.stringify(json));
});


// dynamic routes
app.use('/database/', function (req, res, next) {
  // List all databases 
  const dbFiles = fs.readdirSync("./database");
  let html  = "<h4>Trieu la taula de dades</h4><ul>";
  dbFiles.forEach(file => {
    html += `<li><a href="/database/${file}">${file}</a></li>`
  });
  html +="</ul>";
  res.send(html);
});

// static server 
app.use('/', express.static('static'));




app.listen(3000);
console.log('Application server running on port 3000');
