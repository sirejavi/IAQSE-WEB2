const myjdb = require("../myjdb");
 
module.exports = function(app, mountPoint) {
    
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
        const result = myjdb.persist();
        res.send({result: result});
    });


};