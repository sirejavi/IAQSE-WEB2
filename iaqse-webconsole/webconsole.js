/*************************************************
 * Console d'administració de la web de l'IAQSE
 * Per Josep Mulet (2020)
 * pep.mulet@gmail.com
 * 
 * L'objectiu d'aquesta consola és poder editar
 * els fitxers de base de dades json visualment
 * sense necessitat d'editar-los a ma.
 * 
 * També automatiza els processos de compilació,
 * previsualització i publicació.
 * 
 * Això és tot de moment...
 *************************************************/
// Determina des d'on s'ha cridat el servidor per establir el basePath correcte

console.log(" ************************************************");
console.log(" * Console d'administració de la web de l'IAQSE *");
console.log(" * Per Josep Mulet (2020)                       *");  
console.log(" * pep.mulet@gmail.com                          *");
console.log(" ************************************************");
console.log("");

const path = require('path');
let basePath = path.resolve();
console.log(basePath)
// Algunes preferències
const CONSOLE_WEB_PATH = 'webconsole';

// Carregam tot el que necessitam
const express = require('express');
const ejs = require('ejs');
const app = express(); 
var http = require('http').createServer(app);
app.io = require('socket.io')(http);


// Middleware per parsejar les peticions ajax
const bodyParser = require('body-parser');
app.use(bodyParser.text({ type: 'text/html', defaultCharset: "iso-8859-1" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Estableix ejs com motor de rendertizat al costat del servidor
app.set('view engine', 'ejs');
app.set('views', path.join(basePath, 'iaqse-webconsole/templates'));

// Aquesta middleware serveix les pàgines generades  amb la ISO latin, en comptes de utf8
// Sense això els caràcters accentuats es veurien malament
app.use((req, res, next) => { 
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type,X-Requested-With");
  res.set("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  
  const url = req.originalUrl.split("?")[0].trim();
  
  // Atenció les pàgines de webconsole estàn en utf8 i no s'ha d'establir aquest content type
  if(url.indexOf(CONSOLE_WEB_PATH) < 0) {
      if(url.endsWith(".html")) {
        res.set("Content-Type", "text/html; charset=iso-8859-1");
      } else if(url.endsWith(".svg")) {
        res.set("Content-Type", "text/xml; charset=iso-8859-1");
      } else if(url.endsWith(".json")) {
        res.set("Content-Type", "application/json; charset=iso-8859-1");
      }
  }
  next();
});

// Estableix les middlewares de les pàgines de les consola d'administració
const webConsoleMdw = require('./middleware/webConsoleMdw');
webConsoleMdw(app, CONSOLE_WEB_PATH);
 
// Middleware per a les apis
const webConsoleApi = require('./api/webConsoleApi');
webConsoleApi(app, CONSOLE_WEB_PATH);
 
// static server (webpages)
app.use('/', express.static('static'));




http.listen(3000);
console.log('Application server running on port 3000');
