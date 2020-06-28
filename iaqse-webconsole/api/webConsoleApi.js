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

    app.post('/'+mountPoint+'/api/remove', function(req, res) {

        const tableName = req.body.tableName; 
        const idPath = req.body.idPath;
        const result = myjdb.remove(tableName, idPath);

        res.send({result: result});

    });

    app.post('/'+mountPoint+'/api/add', function(req, res) {

        const objectToAdd = req.body.obj;
        const tableName = req.body.tableName; 
        const idPath = req.body.idPath;
        const insertPosition = req.body.insertPosition;
        const result = myjdb.add(objectToAdd, tableName, idPath, insertPosition);

        res.send({result: result});

    });

    app.post('/'+mountPoint+'/api/update', function(req, res) {

        const newObj = req.body.obj;
        const tableName = req.body.tableName; 
        const idPath = req.body.idPath; 
        const result = myjdb.update(tableName, idPath, newObj);

        res.send({result: result});

    });

    app.post('/'+mountPoint+'/api/reorder', function(req, res) {

        const tableName = req.body.tableName; 
        const idPath = req.body.idPath; 
        const position = req.body.position;
        const result = myjdb.reorder(tableName, idPath, position);

        res.send({result: result});

    });

    app.post('/'+mountPoint+'/api/showtables', function(req, res) {
       res.send({result: myjdb.showtables()});
    });

    app.post('/'+mountPoint+'/api/reset', function(req, res) {
        myjdb.init();
        res.send({result: myjdb.showtables()});
    });

    app.post('/'+mountPoint+'/api/persist', function(req, res) {
        // Pot contenir opcionalment una taula per actualitzar primer
        let result = true;
        let msgs = [];
        if(req.body.table) {
            if(Array.isArray(req.body.table)) {
                req.body.table.forEach((aTable)=> {
                    const r = myjdb.setTable(aTable);
                    if(!r) {
                        msgs.push("Cannot settable ", aTable.name);
                    }
                    result = result && r;
                })
            } else {
                const aTable = req.body.table;
                const r = myjdb.setTable(aTable);
                if(!r) {
                    msgs.push("Cannot settable ", aTable.name);
                }
                result = result && r;
            }
        }
        // Ara desa a disc totes les taules que han estat settable!
        const r = myjdb.persist();
        if(!r) {
            msgs.push("Cannot persist to disc");
        }
        result = result && r;

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

        res.send({result: result, msg: msgs.join(". ")});
    });


};