/**
 * Build the static web page from templates and database
 * using the current configuration set in config/config.json
 */

 // imports
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const utils = require("./utils.js");


// Load configuration
console.log("Reading configuration...");
const config = require("./config/config.json");
const encoding = config.encoding || "utf8";
console.log("\tUsing encoding "+ encoding);
console.log("Reading routes...");
const routes = require("./config/routes.json");
// Crear els punters al parent
let parent = null;
routes.pages.forEach((page) => {
    page.parent = parent
    if(page.views!=null) {
        page.views.forEach( view => {
            utils.setParentToView(view, page); 
        });
    }
});

// Load all database files (which will be passed to views during rendering process)
console.log("Reading database files...");
const dbFiles = fs.readdirSync("./database");
const database = {};
dbFiles.forEach(file=>{
    let name;
    if(file.endsWith(".json")) {
        name = path.basename(file, ".json");
        database[name] = require("./"+path.join("database", file));
    } else if(file.endsWith(".csv")) {
        name = path.basename(file, ".csv");
        const csvContents = fs.readFileSync("./"+path.join("database", file), "utf8");
        database[name] = utils.parseCsv(csvContents);
    }
    let information = " ";
    if(Array.isArray(database[name])) {
        information = database[name].length + " rows";
    } else if(utils.isObject(database[name])) {
        information = "keys: "+ Object.keys(database[name]).join(", ");
    }
    console.log("\tdatabase: ", name, information);
});
database.config = config;
database.routes = routes; 
database.chunk = function(arr, chunkSize) {
    var R = [];
    for (var i=0,len=arr.length; i<len; i+=chunkSize)
        R.push(arr.slice(i,i+chunkSize));
    return R;
};


//************************************************ Determina automàticament destacats */
// Treim les publicacions més noves (aquesta base no s'ha d'editar a ma, per això el JSON no està formatat)
database.destacats = [];
// Agafa les tres primeres publicacions (suposa que estan ordenades!)
[0,1,2,3].forEach( (idx) => {
    const pub = database.publicacions[idx];
    database.destacats.push({
        title: pub.title,
        description: pub.description,
        url: pub.url,
        target: "_blank",
        img: pub.img
    });
});
fs.writeFileSync("./database/destacats.json", JSON.stringify(database.destacats), {encoding: "utf8"});


// Process all routes 
const defaultTemplate = routes.template || "simple";
const baseUrl = routes.baseurl;

// Remove old compilations
try{
    fs.rmdirSync(path.join("./static", baseUrl));
} catch(e){ 
}
try{
    fs.mkdirSync(path.join("./static", baseUrl));
} catch(e){ 
}

routes.pages.forEach( (page) => {

    const currentTemplate = page.template || defaultTemplate;
    // load the template for every page
    const templatePath = path.join("./templates", currentTemplate, "layout.ejs");
    console.log("Loading template ", templatePath);
    const template = fs.readFileSync(templatePath, {encoding: "utf8"});
    const templateLocation = path.resolve(path.join("./templates", currentTemplate, "layout.ejs"));
    console.log("Template location: ", templateLocation);

    // Load the page contents
    const basename = path.basename(page.ejs, ".ejs");
    database.currentPage = path.join(page.url);
    // read page contents
    let fileStr = fs.readFileSync(path.join("./ejs-pages", page.ejs+".ejs"), {encoding: "utf8"});

    if(page.views==null || page.views.length==0) {
        // Cal inserir a la pàgina el breadcrumb
        let breadcrumb = `<nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="index.html"><i class="fas fa-home"></i></a></li> 
          <li class="breadcrumb-item active"> ${page.title_long || page.title} </li>  
        </ol>
        </nav>
        `;
        fileStr = breadcrumb + fileStr;
    }

    database.page = page;
    // A la pàgina cal CREAR tots els views (van en fitxers separats)
    if(page.views) {
        page.views.forEach( view => {
            utils.compileView(view, database);
        });
    }

    // Genera el codi de angular pertinent per gestionar rutes en SPA
    if(page.views && page.views.length > 0) {
            fileStr += `
    <script>
            app.config(function ($routeProvider) {
                        $routeProvider`;

            page.views.forEach( view => {
                fileStr += utils.generateRouteForView(view, "");
            });

            fileStr += `
                .otherwise({
                    redirectTo: '/${page.views[0].url}' 
                });
                
            });
    </script>`;
    }


    // compile it
    const parts = template.split("</main>");
    const pageTemplate = parts[0] + "\n" + fileStr + "</main>"+ parts[1];
   
    // save into static folder as .html
    // Make sure that this directory is created
    const htmlPath = path.join("./static", baseUrl, page.url + ".html");
    const dirPath = path.basename(htmlPath, ".html");
    page.absoluteUrl = dirPath;
    try{
        fs.mkdirSync(dirPath);
    } catch(e){}

     //const compiledPage = ejs.compile(pageTemplate, {filename: templateLocation, name: "layout.ejs"});
    database.view = null;
    const rendered = ejs.render(pageTemplate, database, {filename: templateLocation, name: "layout"});
    console.log("\tWriting html page into ", htmlPath);
    fs.writeFileSync(htmlPath, rendered, {encoding: encoding});

});


 
console.log("All done!");