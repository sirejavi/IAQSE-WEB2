const myjdb = require("../myjdb");
const siteBuilder = require("../../buildtools/sitebuilder");
 
module.exports = function(app, mountPoint) {
    let sharedSocket;
    app.io.on('connection', (socket)=> { 
        console.log("A client has connected to the socket"); 
        sharedSocket = socket;
    });
      


    app.post('/'+mountPoint+'/api/gettable', function(req, res) {
        const tableName = req.body.tableName;
        const table = myjdb.getTable(tableName);

        if(table) {
            res.json(table);
        } else {
            res.status(400).send("Table not found");
        }

    });

    app.post('/'+mountPoint+'/api/settable', function(req, res) {

        const table = req.body.table; 
        const result = myjdb.setTable(table);

        res.send({result: result});

    });

    app.post('/'+mountPoint+'/api/persist', function(req, res) {
        // Pot contenir opcionalment una taula per actualitzar primer
        let result = true;
        if(req.body.table) {
            result = myjdb.setTable(req.body.table);
        }
        // Ara desa a disc totes les taules que han estat settable!
        result =  result && myjdb.persist();

        // Torna a generar el site (en local)
        
        siteBuilder({
            type: 'pages',  //all or database
            development: true
        });
        
        // reload client web page
        app.io.emit('reload-event', {event: 'reload'});
        if(sharedSocket) {
            sharedSocket.broadcast.emit('reload-event', {event: 'reload'});
        }

        res.send({result: result, msg: ''});
    });


};