const query = require("../repositories/async-mysql.js");
let DocumentsCtrl = {};

 
const findClientSQL = `SELECT * FROM IAQSE_CLIENT AS c WHERE c.IP=? LIMIT 1`;
const insertClientSQL = `INSERT INTO IAQSE_CLIENT SET IP=?, LONGITUDE=?, LATITUDE=?`;
const updateClientSQL = `UPDATE IAQSE_CLIENT SET LONGITUDE=?, LATITUDE=? WHERE ID=?`;
DocumentsCtrl.findClient = async function(ip, coords) {
    coords = coords || {};
    const client = await query(findClientSQL, [ip]);
    
    if(client!=null && client.length>0) {
        // UPDATE client geolocation if required
        if(client[0].LONGITUDE==null && coords.longitude!=null){
            query(updateClientSQL, [coords.longitude, coords.latitude, client[0].ID]);
        }
        return client[0];
    }
    const result = await query(insertClientSQL, [ip, coords.longitude, coords.latitude]);
    return {ID: result.insertId, IP: ip, LONGITUDE: coords.longitude, LATITUDE: coords.LATITUDE };
};


const findDocumentSQL = `SELECT * FROM IAQSE_DOCUMENT AS d WHERE d.URL=? AND d.TIPUS=? LIMIT 1`;
const insertDocumentSQL = `INSERT INTO IAQSE_DOCUMENT SET URL=?, TIPUS=?`;
DocumentsCtrl.findDocument = async function(url, type) {
    const docs = await query(findDocumentSQL, [url, type]);
    if(docs!=null && docs.length) {
        return docs[0]; 
    }
    const result = await query(insertDocumentSQL, [url, type]);
    return {ID: result.insertId, URL: url, TIPUS: type};
};

const createVisitSQL = `INSERT INTO IAQSE_VISITA SET CLIENT_ID=?, DOCUMENT_ID=?, FECHA=NOW()`;
DocumentsCtrl.createVisit = async function(clientId, docId) {
    const result = await query(createVisitSQL, [clientId, docId]);
    return result.insertId;
}

DocumentsCtrl.hit = async function(url, type, ip, coords) {
    const client = await DocumentsCtrl.findClient(ip, coords);
    if(client.ID > 0){
        const doc = await DocumentsCtrl.findDocument(url, type);
        if(doc.ID > 0) {
            const visitId = await DocumentsCtrl.createVisit(client.ID, doc.ID);
            return {success: visitId>0};
        }
    }

    return {success: false};
}
 
const documentVisitCountSQL = "SELECT COUNT(v.ID) AS `count` FROM IAQSE_VISITA AS v INNER JOIN IAQSE_DOCUMENT AS d ON v.`DOCUMENT_ID`=d.`ID` WHERE d.`URL`=? AND d.`TIPUS`=?";
DocumentsCtrl.documentVisitCount = function(url, type) {
    return query(documentVisitCountSQL, [url, type])[0];
}

const documentVisitCountIntervalSQL = "SELECT COUNT(v.ID) AS `count` FROM IAQSE_VISITA AS v INNER JOIN IAQSE_DOCUMENT AS d ON v.`DOCUMENT_ID`=d.`ID` WHERE d.`URL`=? AND d.`TIPUS`=? AND v.`FECHA`>=? AND v.`FECHA`<=?";
DocumentsCtrl.documentVisitCountInterval = function(url, type, sqlDate1, sqlDate2) {
    if(sqlDate1==null) {
        sqlDate1 = "2000-01-01";
    }
    if(sqlDate2==null) {
        sqlDate2 = "3000-01-01";
    }
    return query(documentVisitCountIntervalSQL, [url, type, sqlDate1, sqlDate2])[0];
}

const documentVisitSQL = "SELECT v.FECHA, c.IP, c.LONGITUDE, c.LATITUDE FROM IAQSE_VISITA AS v INNER JOIN IAQSE_DOCUMENT AS d ON v.`DOCUMENT_ID`=d.`ID` WHERE d.`URL`=? AND d.`TIPUS`=? AND v.`FECHA`>=? AND v.`FECHA`<=?";
DocumentsCtrl.documentVisitInterval = function(url, type, sqlDate1, sqlDate2) {
    if(sqlDate1==null) {
        sqlDate1 = "2000-01-01";
    }
    if(sqlDate2==null) {
        sqlDate2 = "3000-01-01";
    }
    return query(documentVisitSQL, [url, type, sqlDate1, sqlDate2]);
}

const visitSQL = "SELECT COUNT(v.ID) AS `count`, d.URL, MAX(v.FECHA) AS LAST_ACCESS FROM IAQSE_VISITA AS v INNER JOIN IAQSE_DOCUMENT AS d ON v.`DOCUMENT_ID`=d.`ID` AND v.`FECHA`>=? AND v.`FECHA`<=? GROUP BY d.URL";
const visitTipusSQL = "SELECT COUNT(v.ID) AS `count`, d.URL, MAX(v.FECHA) AS LAST_ACCESS FROM IAQSE_VISITA AS v INNER JOIN IAQSE_DOCUMENT AS d ON v.`DOCUMENT_ID`=d.`ID` AND v.`FECHA`>=? AND v.`FECHA`<=? AND d.`TIPUS`=? GROUP BY d.URL";
DocumentsCtrl.visitInterval = function(tipus, sqlDate1, sqlDate2) {
    if(sqlDate1==null) {
        sqlDate1 = "2000-01-01";
    }
    if(sqlDate2==null) {
        sqlDate2 = "3000-01-01";
    }
    if(tipus) {
        return query(visitTipusSQL, [sqlDate1, sqlDate2, tipus]);
    }    
    return query(visitSQL, [sqlDate1, sqlDate2]);
}

const geolocationsSQL = "SELECT DISTINCT c.LATITUDE, c.LONGITUDE FROM IAQSE_CLIENT AS c INNER JOIN IAQSE_VISITA AS v ON v.CLIENT_ID=c.ID WHERE v.FECHA>=? AND v.FECHA<=?";
DocumentsCtrl.geolocations = function(sqlDate1, sqlDate2) {
    if(sqlDate1==null) {
        sqlDate1 = "2000-01-01";
    }
    if(sqlDate2==null) {
        sqlDate2 = "3000-01-01";
    }
    return query(geolocationsSQL, [sqlDate1, sqlDate2]);
}


const listTipusDocumentsSQL = "SELECT DISTINCT d.TIPUS FROM IAQSE_DOCUMENT AS d ORDER BY d.TIPUS ASC";
DocumentsCtrl.listTipusDocuments = function() {
    return query(listTipusDocumentsSQL);
}

const listDocumentsSQL = "SELECT d.* FROM IAQSE_DOCUMENT AS d WHERE d.TIPUS=? ORDER BY d.URL ASC";
DocumentsCtrl.listDocuments = function(tipus) { 
    return query(listDocumentsSQL, [tipus]);
}

const historySQL = `SELECT date_format(v.FECHA, "%d/%m/%y %H:%i:%S") AS FECHA, c.IP, c.LATITUDE, c.LONGITUDE 
FROM IAQSE_VISITA AS v INNER JOIN IAQSE_CLIENT AS c on v.CLIENT_ID=c.ID INNER JOIN
IAQSE_DOCUMENT AS d ON v.DOCUMENT_ID=d.ID WHERE d.URL=? ORDER BY FECHA DESC`;
DocumentsCtrl.history = function(url) { 
    return query(historySQL, [DocumentsCtrl.normalizeUrl(url)]);
}


DocumentsCtrl.normalizeUrl = function(url) {
    url = url || "";
    url = (url+"").trim();
    url = url.replace(/\.\.\//g,'');
    url = url.toLowerCase();
    url = url.split("?")[0].trim();
    return url;
}

DocumentsCtrl.obteTipus = function(url) {
    let tipus  = "";
    if(url.indexOf(".pdf")>=0 || url.indexOf(".odt")>=0 || url.indexOf(".doc")>=0 || url.indexOf(".docx")>=0 || url.indexOf(".zip")>=0 || url.indexOf(".rar")>=0) {
        tipus  = "DOC";
    } else if(url.endsWith(".html") || url.endsWith(".html")) {
        if(url.indexOf("#!/")>=0) 
            tipus = "VIEW";
        else
            tipus = "PAGE";
    } else if(url.indexOf("#!/")>=0) {
        tipus = "VIEW";
    }
    return tipus;
}


const timeline1SQL = `SELECT date_format(date(v.FECHA), "%d/%m/%y") AS dia, count(v.id) AS \`count\`, count(DISTINCT v.CLIENT_ID) as clients FROM IAQSE_VISITA AS v INNER JOIN 
IAQSE_DOCUMENT AS d ON v.DOCUMENT_ID=d.ID WHERE v.FECHA>=? AND v.FECHA<=?
GROUP BY date(v.FECHA) ORDER BY v.FECHA desc`;

DocumentsCtrl.timeline = function(url, sqlDate1, sqlDate2) {
    if(sqlDate1==null) {
        sqlDate1 = "2000-01-01";
    }
    if(sqlDate2==null) {
        sqlDate2 = "3000-01-01";
    }
    if(url) {
        const timeline2SQL = `SELECT date_format(date(v.FECHA), "%d/%m/%y") AS dia, count(v.id) AS \`count\`, count(DISTINCT v.CLIENT_ID) as clients FROM IAQSE_VISITA AS v INNER JOIN 
IAQSE_DOCUMENT AS d ON v.DOCUMENT_ID=d.ID WHERE v.FECHA>=? AND v.FECHA<=?
AND d.URL LIKE '%${url}' GROUP BY date(v.FECHA) ORDER BY v.FECHA desc`;

        return query(timeline2SQL, [sqlDate1, sqlDate2]);
    }    
    return query(timeline1SQL, [sqlDate1, sqlDate2]);
}

module.exports = DocumentsCtrl;