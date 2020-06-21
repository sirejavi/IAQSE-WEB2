// server.js
// load the things we need
const bodyParser = require('body-parser');
const express = require('express');
const ejs = require('ejs');
const fs = require("fs");
const app = express();
const config = require('../config/config.json');

app.use(bodyParser.text({ type: 'text/html', defaultCharset: "iso-8859-1" }));
app.set('view engine', 'ejs');
app.set('views', './dev-server/templates');
app.use((req, res, next) => { //change app.all to app.use here and remove '*', i.e. the first parameter part
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type,X-Requested-With");
  res.set("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  const url = req.originalUrl.split("?")[0].trim();
  if(url.endsWith(".html")) {
    res.set("Content-Type", "text/html; charset=iso-8859-1");
  } else if(url.endsWith(".svg")) {
    res.set("Content-Type", "text/xml; charset=iso-8859-1");
  } else if(url.endsWith(".json")) {
    res.set("Content-Type", "application/json; charset=iso-8859-1");
  }
  next();
});

// renderitza pàgina d'aministració
app.get('/adminconsole', function (req, res) {
   res.render('adminconsole', {config: config});
});

// Mostra el contingut d'un esquema "alias fitxer json"
app.get('/adminconsole/database/:schema', function (req, res) {
  const json = require('./database/'+req.params.schema);
  res.send(JSON.stringify(json));
});


// dynamic routes
app.use('/adminconsole/database/', function (req, res, next) {
  // List all databases 
  const dbFiles = fs.readdirSync("./database");
  let html  = "<h4>Trieu la taula de dades</h4><ul>";
  dbFiles.forEach(file => {
    html += `<li><a href="/database/${file}">${file}</a></li>`
  });
  html +="</ul>";
  res.send(html);
});

// api
app.get('/adminconsole/api/select', function (req, res) {
  console.log(req)
  res.json({});
});

// static server 
app.use('/', express.static('static'));




app.listen(3000);
console.log('Application server running on port 3000');
