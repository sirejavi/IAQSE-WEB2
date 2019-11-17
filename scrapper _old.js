/**
 * Scrapper
 * Construeix les bases de dades en format JSON
 * a partir de les pàgines web antigues,
 * 
 * empra cheerio que és una emulació de jQuery
 * per a nodejs
 */

const cheerio = require('cheerio');
const fs = require("fs");
const path = require("path");
const utils = require("./utils");

let readFrom = "./cat";  // old files before changes
//let readFrom = "./static/cat" // new files, new structure

let dirPub = readFrom + "/publicacions/publicacions.html";
let pubs = fs.readFileSync(path.resolve(dirPub), "latin1");
let $ = cheerio.load(pubs);

let publications = [];

console.log("Si continuau es sobreescriuran les dades(*.json) de dades del directori database/. Continuar? (Si/No):");
// small because I'm only reading a few bytes
const BUFFER_LENGTH = 8;

const stdin = fs.openSync('/dev/stdin', 'rs');
const buffer = Buffer.alloc(BUFFER_LENGTH);

fs.readSync(stdin, buffer, 0, BUFFER_LENGTH);
const ans = buffer.toString().trim().replace(/\n/,""); 
fs.closeSync(stdin);
if(ans.length<2 || ans[0]+ans[1]!="Si") {
    console.log("Procés cancel·lat");
    process.exit(0);
}

//************************************************************************************************ PUBLICACIONS */
$(".div_bloque_publicacion").each(function(i, elem) {
    const $self = $(this);
    const destacado = ($self.attr("data-destacado") || "").toLocaleLowerCase() == "s";
    const datatags = ($self.attr("data-tags") || "").split(",").map(e => e.trim().toLocaleLowerCase());

    const url = utils.normalizeUrl($self.find(".div_img_publicacion > a").attr("href"));
    const img = utils.normalizeUrl($self.find(".div_img_publicacion > a > img.img_publicacion").attr("src"));

    const title = utils.normalizeText($self.find(".div_bloque_pub_cont > .div_bloque_pub_titulo > p").text());

    const pubdate_str = utils.normalizeText($self.find(".div_bloque_pub_cont > .div_bloque_pub_fecha > p").text()); 
    const description = utils.normalizeText($self.find(".div_bloque_pub_cont > .div_bloque_pub_texto > p").text()); 
    const eventDate = utils.findDateFromUrl(url);
    let publication = {
        destacado: destacado,
        tags: datatags,
        img: img,
        title: title,
        description: description,
        url: url,
        // Distingim entre la data de l'event i la data de la publicació
        date: eventDate,    
        pubdate: utils.findDateFromPubdate(pubdate_str) || eventDate        
    };
    publications.push(publication);
});

fs.writeFileSync("./database/publicacions.json", JSON.stringify(publications, null, 4));

//************************************************************************************************ */

let enllacos = [];

let ubicacions = [];
for(let i=1; i<=8; i++) {
    ubicacions.push(readFrom + "/enllacos/enllacos_"+i+".html");
}

ubicacions.forEach( (dirPub) => {
    
    file = fs.readFileSync(path.resolve(dirPub), "latin1");
    $ = cheerio.load(file);

    const type = $(".div_sub_cat_ind > span").text().replace(/\n/g, "").replace(/\t/g, "").trim();
 
    let aList = [];
    $("div.div_bloque_elem_pdf").each(function(i, elem){
        const self = $(this);
        const url = self.find("a").attr("href").trim();
        const url_title = utils.normalizeText(self.find("a").attr("title"));
        const img = utils.normalizeUrl(self.find("a > div > img.img_pdf_bloque").attr("src"));
        const img_title = utils.normalizeText(self.find("a > div > img.img_pdf_bloque").attr("title"));
        const description = utils.normalizeText(self.find("a > div > p").text());
        aList.push({
            url: url,
            url_title: url_title,
            img: img,
            img_title: img_title,
            description: description
        })
    });

    let linkCategory = {
        type: type,
        list: aList
    }
    enllacos.push(linkCategory);
});


fs.writeFileSync("./database/enllacos.json", JSON.stringify(enllacos, null, 4));

//************************************************************************************************ */

dirPub =readFrom + "/quisom/personal.html";
file = fs.readFileSync(path.resolve(dirPub), "latin1");
$ = cheerio.load(file);
const personal = [];


$(".div_bloque_persona").each(function(i, elem) {
    const $self = $(this);
    
    const img = utils.normalizeUrl($self.find(".div_img_persona > img").attr("src"));
    const nom = utils.normalizeText($self.find(".div_bloque_persona_cont > .div_bloque_persona_nombre > p").text());
    const carrec = utils.normalizeText($self.find(".div_bloque_persona_cargo > p").text());
    const ext = utils.normalizeText($self.find(".div_bloque_persona_ext > p").text());
    const email = utils.normalizeText($self.find(".div_bloque_persona_correu > p").text());

    let persona = { 
        img: img,
        nom: nom, 
        carrec: carrec,
        ext: ext,
        email: email
    };
    personal.push(persona);
});
fs.writeFileSync("./database/personal.json", JSON.stringify(personal, null, 4));

//************************************************************************************************ */

dirPub = readFrom + "/quisom/normativa.html";
file = fs.readFileSync(path.resolve(dirPub), "latin1");
$ = cheerio.load(file);
const normativa = [];
 
$(".div_bloque_elem_pdf").each(function(i, elem) {
    const $self = $(this);
    
    const url = utils.normalizeUrl($self.find("a").attr("href"));
    const img = utils.normalizeUrl($self.find("a > .div_bloque_elem_pdf_link > img").attr("src"));
    const title =  utils.normalizeText($self.find("a > .div_bloque_elem_pdf_link > p").text());
 
    let norma = { 
        img: img,
        url: url, 
        title: title
    };
    normativa.push(norma);
});
fs.writeFileSync("./database/normativa.json", JSON.stringify(normativa, null, 4));

//************************************************************************************************ */

//************************************************************************************************ */

const nivells = ["2nESO", "3rEP", "4tEP", "4tESO", "6eEP"];
ubicacions = nivells.map(str => readFrom + "/proves/proves"+str+".html");
const proves = [];

ubicacions.forEach( (dirPub, i) => {
    file = fs.readFileSync(path.resolve(dirPub), "latin1");
    $ = cheerio.load(file);

    const aval = $(".div_nombre_eva > .div_sub_cat_ind > span").text().trim(); 

  
    $(".div_bloque_elem_pdf").each(function(j, elem){

        const $self = $(this);
        const tags = ($self.attr("data-tags") || "").split(",").map(e => e.trim());
        const url = utils.normalizeUrl($self.find("a").attr("href"));
        const url_title = utils.normalizeText($self.find("a").attr("title"));
        const img = utils.normalizeUrl($self.find("a > .div_bloque_elem_pdf_link > img").attr("src"));
        const title = utils.normalizeText($self.find("a > .div_bloque_elem_pdf_link > p").text());

        let prova = {
            aval: aval,
            nivell: nivells[i],
            tags: tags,
            url: url,
            url_title: url_title,
            img: img,
            title: title,
            any: title.split("curs ")[1].replace(".", "").trim(),
            documents: []
       } ;
    
       proves.push(prova);
    });
   
});
 
 
$(".div_bloque_elem_pdf").each(function(i, elem) {
    const $self = $(this);
    
    const url = utils.normalizeUrl($self.find("a").attr("href"));
    const img = utils.normalizeUrl($self.find("a > .div_bloque_elem_pdf_link > img").attr("src"));
    const title = utils.normalizeText($self.find("a > .div_bloque_elem_pdf_link > p").text());
 
    let norma = { 
        img: img,
        url: url, 
        title: title
    };
    normativa.push(norma);
});
fs.writeFileSync("./database/proves.json", JSON.stringify(proves, null, 4));

//************************************************************************************************ AVALUACIONS */
function avaluacioProcessor(dirPub) {
    file = fs.readFileSync(path.resolve(dirPub), "latin1");
    $ = cheerio.load(file);
    const avaluacions = [];
     
    $(".div_bloque_menu_eva").each(function(i, elem) {
        const self = $(elem);
        const fitxer = self.find("a").attr("href").trim();
        const title0 = utils.normalizeText(self.find("a>div>p").text());
        // En funció del titol de l'avaluació caldria deduir de quin tipus d'avaluació es tracta
        const titleup = title0.toLocaleUpperCase();
        let tag = "";
        if(titleup.indexOf("EP ")>=0){
            tag = "EP";
        } else if(titleup.indexOf("ESO ")>=0){
            tag += " ESO";
        } else if(titleup.indexOf("PIRLS")>=0){
            tag += " PIRLS";
        } else if(titleup.indexOf("TALIS")>=0){
            tag += " TALIS";
        } else if(titleup.indexOf("PEOPAU")>=0){
            tag += " PEOPAU";
        } else if(titleup.indexOf("DIAGNÒSTIC")>=0){
            tag += " DIAGNOSTIC";
        } else if(titleup.indexOf("FINAL")>=0){
            tag += " FINAL";
        } 
        let ava = {title: title0, tag: tag, documents: []};
    
        console.log(fitxer, title0);
    
        const dirPub2 = path.join(path.dirname(dirPub), fitxer);
        const file2 = fs.readFileSync(path.resolve(dirPub2), "latin1");
        $c2 = cheerio.load(file2);
    
        $c2(".div_bloque_elem_pdf").each(function(j, elem2){
            const self2 = $c2(elem2);
            const url = utils.normalizeUrl(self2.find("a").attr("href"));
            const description = utils.normalizeText(self2.find("a").attr("title"));
            const img = utils.normalizeUrl(self2.find("a > .div_bloque_elem_pdf_link > img").attr("src"));
            const title = utils.normalizeText(self2.find("a > .div_bloque_elem_pdf_link > p").text());
            
            ava.documents.push({
                title: title,
                url: url,
                img: img,
                description: description
            });
            
        });
    
        avaluacions.push(ava);
    });
    return avaluacions;
}

 
dirPub = readFrom + "/avaluacions/finaletapa/ava_finaletapa.html";
var finaletapa_avaluacions = avaluacioProcessor(dirPub);
fs.writeFileSync("./database/finaletapa_avaluacions.json", JSON.stringify(finaletapa_avaluacions, null, 4));

//************************************************************************************************ */
 
dirPub = readFrom + "/avaluacions/diagnostic/diagnostic.html";
var diagnostic_avaluacions = avaluacioProcessor(dirPub);
fs.writeFileSync("./database/diagnostic_avaluacions.json", JSON.stringify(diagnostic_avaluacions, null, 4));

//************************************************************************************************ */
 
dirPub = readFrom + "/avaluacions/altres/altres.html";
var altres_avaluacions = avaluacioProcessor(dirPub);
fs.writeFileSync("./database/altres_avaluacions.json", JSON.stringify(altres_avaluacions, null, 4));

//************************************************************************************************ */
 
dirPub = readFrom + "/avaluacions/pisa/pisa.html";
var pisa_avaluacions = avaluacioProcessor(dirPub);
fs.writeFileSync("./database/pisa_avaluacions.json", JSON.stringify(pisa_avaluacions, null, 4));

//*************************************************************************************************/

dirPub = readFrom + "/avaluacions/primaria/ava_primaria.html";
var primaria_avaluacions = avaluacioProcessor(dirPub);
fs.writeFileSync("./database/primaria_avaluacions.json", JSON.stringify(primaria_avaluacions, null, 4));



//************************************************************************************************ INDICADORS */
// COMBINAR INDICADORS AMB PUBLICACIONS DE TIPUS INDICADORS I EVITAR DUPLICATS
dirPub = readFrom + "/indicadors/indicadors.html";
file = fs.readFileSync(path.resolve(dirPub), "latin1");
$ = cheerio.load(file);
let indicadors = [];
$(".div_bloque_elem_pdf").each(function(i, elem) {
    const $self = $(this);
    
    const url = utils.normalizeUrl($self.find("a").attr("href"));
    const img = utils.normalizeUrl($self.find("a > div.div_bloque_elem_pdf_link > img.img_pdf_bloque").attr("src"));

    const title = utils.normalizeText($self.find("a > div.div_bloque_elem_pdf_link > p").text());
 
    let indicador = { 
        tag: "ISEIB",
        img: img,
        title: title, 
        url: url,
        date: img.split("_")[1].split(".")[0]
    };
    indicadors.push(indicador);
});
// itera publicacions (determina el tipus) i si no està en indicadors, afegeix-li
publications.forEach(pub=>{
    if(pub.tags.indexOf("indicadors")>=0 || pub.tags.indexOf("resultats")>=0) {
        // Determina si el mateix document està apuntat en algun de la base indicadors
        var found = false;
        var k = 0;
        var len = indicadors.length;
        while(!found && k<len) {
            var indi = indicadors[k];
            if(indi.url == pub.url) {
                found = true;
            }
            k++;
        }
        if(!found) {
            // Copia la publicació també dins indicadors
            indicadors.push({
                tag: pub.tags.indexOf("indicadors")>=0? "ISEIB": "RESULTATS",
                img: pub.img,
                title: pub.title,
                url: pub.url,
                date: pub.date
            });
        }
    }
});
// Ordena per camp date
indicadors = indicadors.sort( (i1, i2)=> {
    let d1 = utils.toDate(i1.date);
    let d2 = utils.toDate(i2.date);
    // De mes nou a més antic
    return d2.getTime()-d1.getTime();
});

fs.writeFileSync("./database/indicadors.json", JSON.stringify(indicadors, null, 4));
