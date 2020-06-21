var mysql = require('mysql');
var config = require('../config.json')
const pool = mysql.createPool(config.pool);

var async_query = function(sqlQuery, params) {
    return new Promise((resolve, reject) => {
        pool.getConnection(function(err, connection) {
            if (err) {
                reject(err);
                return;
            }            
            // Use the connection          
            connection.query(sqlQuery, params, function (error, results, fields) {
                // When done with the connection, release it.
                connection.release(); 
                // Handle error after the release.
                if (error) {
                    //console.log("QUERY->", sqlQuery, params, " -> ", error, "\n");
                    reject(error);
                } else {
                    /*
                    if(sqlQuery.toUpperCase().indexOf("SELECT") >= 0) {
                        console.log("QUERY SELECT->", sqlQuery, params, " -> LEN=", results.length, "\n");
                    } else {
                        console.log("QUERY U/D->", sqlQuery, params, " -> ", results, "\n");
                    }
                    */
                    resolve(results);
                }                            
            });
        });
    
    });
};

module.exports = async_query;