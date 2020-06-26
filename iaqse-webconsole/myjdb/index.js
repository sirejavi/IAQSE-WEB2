const fs = require('fs');

let inMemoryDB = {};

// Carrega tota la db en memoria
const init = function() {
    // elimina possibles elements anteriors
    inMemoryDB = {};

    const configFiles = fs.readdirSync('./config');
    configFiles.forEach( (fileName) => {
        if(fileName.endsWith(".json")) {
            const content = fs.readFileSync("./config/"+fileName, {encoding: 'utf8'});
            fileName = fileName.replace(".json", "");
            fileName = 'config/' + fileName;
            inMemoryDB[fileName] = {
                name: fileName,
                modified: false,
                contents: JSON.parse(content)
            };
        }
    });

    const databaseFiles = fs.readdirSync('./database');
    databaseFiles.forEach( (fileName) => {
        if(fileName.endsWith(".json")) {
            const content = fs.readFileSync("./database/"+fileName, {encoding: 'utf8'});
            fileName = fileName.replace(".json", "");
            inMemoryDB[fileName] = {
                name: fileName,
                modified: false,
                contents: JSON.parse(content)
            };
        }
    });

    console.log("Memory DB: ", Object.keys(inMemoryDB));
};


const persist = function() {
    // persisteix les taules modificades a disc

    let changes = false;
    Object.keys(inMemoryDB).forEach( (tableName)=> {

        const table = inMemoryDB[tableName];
        if(table.modified) {
            let outputFile = "./";
            if(tableName.indexOf("/") < 0) {
                outputFile += "database/";
            }
            outputFile += tableName + ".json";
            const content = JSON.stringify(table.contents, null, 2);
            console.log("*****PERSIST: ", outputFile);
            fs.writeFileSync(outputFile, content, {encoding: 'utf8'});
            changes = true;
            table.modified = false;
        }

    });
    return changes;
};


const getTable = function(tableName) {
    return inMemoryDB[tableName];
};

const setTable = function(table) {
    console.log("setting table ", table)
    table.modified = true;
    let existeix = false;
    if(inMemoryDB[table.name]) {
        existeix = true;
    }
    inMemoryDB[table.name] = table;
    return existeix;
};

const getModified = function(tableName) {
    return ((inMemoryDB[tableName] || {}).modified) || false;
};
 
init();

module.exports = {
    init: init,
    persist: persist,
    getTable: getTable,
    setTable: setTable,
    getModified: getModified 
};