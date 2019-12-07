const query = require("../repositories/async-mysql.js");
const uuidv1 = require('uuid/v1');
let UsersCtrl = {};


const findSessionSQL = `SELECT u.* FROM IAQSE_SESSION AS s INNER JOIN IAQSE_USERS AS u ON s.USER_ID=u.ID WHERE s.SESSION=?`;
UsersCtrl.findUserFromSession = async function(sessionId) {
    await UsersCtrl.clearOldSessions();    
    const user = await query(findSessionSQL, [sessionId]);
    return user[0];
}


const createSessionSQL = `INSERT INTO IAQSE_SESSION SET USER_ID=?, SESSION=?, CREATED=NOW()`;
UsersCtrl.createSession = async function(userId) {
    const sessionId = uuidv1();
    await query(createSessionSQL, [userId, sessionId]);
    return sessionId;
}

const clearSessionsSQL = `DELETE FROM IAQSE_SESSION WHERE TIMESTAMPDIFF(HOUR, NOW(), CREATED)>24`;
UsersCtrl.clearOldSessions = function() {
    return query(clearSessionsSQL);
}
 
const authenticateSQL = `SELECT * FROM IAQSE_USERS AS u WHERE u.USERNAME=? AND u.PASSWORD=MD5(?)`;
UsersCtrl.login = async function(username, password) {
    const rows = await query(authenticateSQL, [username, password]);
    if(rows!=null && rows.length) {
        const user = rows[0];
        const sessionId = await UsersCtrl.createSession(user.ID);
        return {authenticated: true, sessionId: sessionId, username: user.USERNAME, fullname: user.FULLNAME};
    }
    return {authenticated: false};
};
 
const logoutSQL = `DELETE FROM IAQSE_SESSION WHERE SESSION=?`;
UsersCtrl.logout = async function(sessionId) {
    const result = await query(logoutSQL, [sessionId]);
    return {authenticated: result.affectedRows>0};
};

module.exports = UsersCtrl;