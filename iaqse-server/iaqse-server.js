// Express

const express = require('express');
const bodyParser = require('body-parser'); 
const app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.set('view engine', 'ejs');
 
const userCtrl = require("./controllers/user-controller");
const DocumentsCtrl = require("./controllers/doc-controller");

// middleware require authentication
const isAuthenticated = async function(sessionId) {
	if(sessionId) {
		const user = await userCtrl.findUserFromSession(sessionId);
		return user!=null && user.ID>0;
	} else {
		return false;
	}
}
 
// Middleware de seguritat
const securityMdw = async function(req, res, next) {
	 if(req.url.indexOf("/iaqseapi/priv")>=0 && !await isAuthenticated(req.body.sessionId)) { 
		res.status(300).send({});
		return;
	} 
	next();
};

// Routes
app.get('/iaqseapi/', async function (req, res) {
	res.render("welcome.ejs");
});

app.get('/iaqseapi/date', async function (req, res) {
	res.send(new Date());
});

app.post('/iaqseapi/authenticate', async function (req, res) {
	const sessionId = req.body.sessionId;
	const user = await userCtrl.findUserFromSession(sessionId);
	if(user!=null) {
		res.send({authenticated: true, fullname: user.FULLNAME, username: user.USERNAME});
		return;
	}
	res.send({authenticated: false});
});

app.post('/iaqseapi/login', async function (req, res) {
	const p = req.body;
	const ack = await userCtrl.login(p.username, p.password);
	res.send(ack);
});

app.post('/iaqseapi/visit/hit', async function (req, res) {
	const p = req.body;
	const ip = req.ip ||
	(req.headers['x-forwarded-for'] || '').split(',').pop() || 
	req.connection.remoteAddress || 
	req.socket.remoteAddress || 
	req.connection.socket.remoteAddress;
	
	const url = DocumentsCtrl.normalizeUrl(p.url); 
	const tipus = p.tipus || DocumentsCtrl.obteTipus(url);

	const ack = await DocumentsCtrl.hit(url, tipus, ip, p.coords);
	res.send(ack);
});
 
////////// PRIVADES

app.post('/iaqseapi/priv/logout', async function (req, res) {
	const p = req.body;
	const ack = await userCtrl.logout(p.sessionId);
	res.send(ack);
});
 
app.post('/iaqseapi/priv/document/tipus/list', async function (req, res) {
	const p = req.body;
	const list = await DocumentsCtrl.listTipusDocuments();
	res.send(list);
});

app.post('/iaqseapi/priv/document/list', async function (req, res) {
	const p = req.body;
	const list = await DocumentsCtrl.listDocuments(p.tipus)
	res.send(list);
});
 
app.post('/iaqseapi/priv/visit/count', async function (req, res) {
	const p = req.body;
	 res.send(await DocumentsCtrl.documentVisitCountInterval(p.url, p.tipus, p.sqlDate1. p.sqlDate2));
});
 
app.post('/iaqseapi/priv/visit/list4doc', async function (req, res) {
	const p = req.body;
	 res.send(await DocumentsCtrl.documentVisitInterval(p.url, p.tipus, p.sqlDate1. p.sqlDate2));
});
 
app.post('/iaqseapi/priv/visit/list', securityMdw, async function (req, res) {
	const p = req.body;
	const list = await DocumentsCtrl.visitInterval(p.tipus, p.sqlDate1, p.sqlDate2);
	res.send(list);
});

app.post('/iaqseapi/priv/visit/geolocations', async function (req, res) {
	 const p = req.body;
	 res.send(await DocumentsCtrl.geolocations(p.sqlDate1, p.sqlDate2));
}); 

app.post('/iaqseapi/priv/visit/timeline', async function (req, res) {
	 const p = req.body;
	 const list = await DocumentsCtrl.timeline(p.url, p.sqlDate1, p.sqlDate2);
	 res.send(list);
}); 

 
app.listen(3009, function () {
	console.log('iaqse server listening on port 3009!');
});

