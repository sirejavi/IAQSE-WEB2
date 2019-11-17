// utils
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
let utils = {}; 
const encoding = require("./config/config.json").encoding || "utf8";
const htmlMinifier = require('html-minifier').minify; 
const config = require("./config/config.json");


utils.isObject = function(a) {
    return (!!a) && (a.constructor === Object);
};

utils.parseCsv = function(csv) {
    let rows = [];
    const lines = csv.split("\n");
    let i = 0;
    let separator = ";";
    let columnNames = [];
    let castTo = [];
    lines.forEach((line)=>{
        // Remove comments
        line = line.split("#")[0].trim();
        if(line.length == 0){
            return;
        }
        if(i==0) {
            // Must read the separator
            separator = line.trim();
            i++;
            return;
        } else if(i==1) {
            // Must read the column names;
            line.split(separator).forEach((column)=>{
                const name_type = column.split(":");
                columnNames.push(name_type[0].trim());
                castTo.push(name_type.length>1? name_type[1].trim(): "");
            });
            i++;
            return;
        }
        // Read contents
        let obj = {};
        let j = 0;
        line.split(separator).forEach((item)=>{
            if(j < columnNames.length) {
                let value = item.trim();
                if(castTo[j].length) {
                    if(castTo[j] == "int") {
                        value = parseInt(value);
                    } else if(castTo[j] == "float") {
                        value = parseFloat(value);
                    } else if(castTo[j] == "boolean") {
                        value = value == 1 || value == "true";
                    }
                }
                obj[columnNames[j]] = value;
                j++;
            }
        });
        i++;
        rows.push(obj);
    });
    return rows;
}

/**
 * Recursive tree, search for parent views
 */
utils.setParentToView = function(view, parent){
    view.parent = parent;
    if(view.views!=null){
        view.views.forEach((view2)=>{
            utils.setParentToView(view2, view);
        });
    }
}

/**
 * A partir d'una vista.ejs
 * crea una view_vista.html
 */
utils.compileView = function(view, database) {
    database.view = view;
    const ejsPath = path.join("./ejs-pages", view.ejs +".ejs");
    const dirPath = path.basename(ejsPath); 
    let viewStr = fs.readFileSync(ejsPath, {encoding: "utf8"});
    // Afegeix a la view el breadcrumb
    let breadcrumb = [];
    breadcrumb.unshift("</nav>");
    breadcrumb.unshift("</ol>");
    breadcrumb.unshift(`<li class="breadcrumb-item active">${view.title}</li>`);
    let node = view.parent;
    while(node!=null) {
        if(node.parent==null){
            // he arribat a la pàgina (recarrego la pàgina)
            breadcrumb.unshift(`<li class="breadcrumb-item"><a href="#">${node.title_long || node.title}</a></li>`);
        } else {
            // estic a una vista (faig navegació a la vista)
            breadcrumb.unshift(`<li class="breadcrumb-item"><a href="#!${node.url}">${node.title_long || node.title}</a></li>`);
        }
        node = node.parent;
    }
 
    breadcrumb.unshift('<li class="breadcrumb-item"><a href="index.html"><i class="fas fa-home"></i></a></li>');
    breadcrumb.unshift('<ol class="breadcrumb">');
    breadcrumb.unshift('<nav aria-label="breadcrumb">');
 
    viewStr = breadcrumb.join("\n") + viewStr;
    let rendered = ejs.render(viewStr, database, {filename: ejsPath, name: "layout"});
    const htmlPath = path.join("./static", database.routes.baseurl, "view_" + view.parent.url + "_" + view.url + ".html");
    console.log("\t\tWriting html view into ", htmlPath);
    if(config.minify_html) {
        rendered = htmlMinifier(rendered, {minifyJS: true, minifyCSS: true, removeComments: true});
    }
    fs.writeFileSync(htmlPath, rendered, {encoding: encoding});

    if(view.views!=null) {
        view.views.forEach( view2 => utils.compileView(view2, database) );
    }
};

utils.generateRouteForView = function(view, str){

    str += `.when("/${view.url}", {
        templateUrl: "view_${view.parent.url}_${view.url}.html"
        `;
    if(view.controller){
        str += `,\n\tcontroller: "${view.controller}Controller"
        `;
    }
    str += `}) 
    `;
    

    if(view.views!=null){
        view.views.forEach( view2 => {
            str = utils.generateRouteForView(view2, str);
        });
    }
    

    return str;
}

utils.findDateFromPubdate = function(pubdate) {
    // Intenta descobrir la data des de pubdate
    // (publicat el mes d'abril de 2019)
    pubdate = pubdate.toLocaleLowerCase().replace("(","").replace(")","").trim();
    let mes = -1;
    if(pubdate.indexOf("gener")>=0) {
        mes = 1;
    } else if(pubdate.indexOf("febrer")>=0) {
        mes = 2;
    } else if(pubdate.indexOf("març")>=0) {
        mes = 3;
    } else if(pubdate.indexOf("abril")>=0) {
        mes = 4;
    } else if(pubdate.indexOf("maig")>=0) {
        mes = 5;
    } else if(pubdate.indexOf("juny")>=0) {
        mes = 6;
    } else if(pubdate.indexOf("juliol")>=0) {
        mes = 7;
    } else if(pubdate.indexOf("agost")>=0) {
        mes = 8;
    } else if(pubdate.indexOf("setembre")>=0) {
        mes = 9;
    } else if(pubdate.indexOf("octubre")>=0) {
        mes = 10;
    } else if(pubdate.indexOf("novembre")>=0) {
        mes = 11;
    } else if(pubdate.indexOf("desembre")>=0) {
        mes = 12;
    }
 
    let date="";
    if(pubdate.indexOf("de 20")>=0) {
        date = "20" + pubdate.split("de 20")[1];
    } else {
        date = "";
    }
    if(mes > 0){
        date = mes+"/"+date;
    }

    return date;
};

utils.findDateFromUrl = function(url) {
    let date = "";
    // Intenta obtenir l'any des de url
    //_2017.pdf o _17.pdf o 17.pdf o 2017.pdf
    url = url.toLocaleLowerCase();
    const idx = url.lastIndexOf("."); 
    url = url.substring(0, idx);
    let index = url.lastIndexOf("_");
    if(index>0) {
        date = url.substring(index+1);
        if(date.length<4) {
            date = "20"+date;
        }
    } else {
        date = "";
    }
    return date;
}



utils.toDate = function(str) {
    // str pot tenir la forma
    // dia/mes/any
    // mes/any    : suposa dia 1
    // any        : suposa mes 1 i  dia 1
    // empty      : suposa 1/1/2000

    if(!str || !str.trim()) {
        return new Date(2000, 0, 1, 0, 0, 0, 0);
    }

    const parts = str.split("/");
    if(parts.length===3){
        let mes = parseInt(parts[1])-1;
        return new Date(parseInt(parts[2]), mes, parseInt(parts[0]), 0, 0, 0, 0);
    } else if(parts.length===2){
        let mes = parseInt(parts[0])-1;
        return new Date(parseInt(parts[1]), mes, 1, 0, 0, 0, 0); 
    } else  if(parts.length===1){
        return new Date(parseInt(parts[0]), 1, 1, 0, 0, 0, 0);
    } else {
        return new Date(2000, 0, 1, 0, 0, 0, 0);
    }
}

utils.normalizeUrl=function(url){
    url = url.replace("../../", "").replace("../../", "").replace("http://iaqse.caib.es/", "").trim();
    return url;
}
utils.normalizeText = function(txt) {
    return txt.replace(/\n/g, " ").replace(/\t/g, " ").replace(/  +/g, " ").trim();
}
module.exports = utils;