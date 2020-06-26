/**
 * Build the static web page from templates and database
 * using the current configuration set in config/config.json
 */
// imports
const ejs = require("ejs");
const fs = require("fs");
const fsutils = require("./fsutils");
const path = require("path");
const utils = require("./utils.js");
const htmlMinifier = require('html-minifier').minify;
const bundleBuilder = require('./bundlebuilder.js');
//const { exec } = require('child_process');

module.exports = function (buildOptions) {

    buildOptions = buildOptions || {
        type: 'pages',              // all, pages, db
        production: false
    };
 
    // Load configuration
    console.log("Reading configuration...");
    const config =  utils.requireJSON("./config/config.json", {encoding: 'utf8'}); 
    const encoding = config.encoding || "utf8";
    console.log("\tUsing encoding " + encoding);
    console.log("Reading routes...");
    const routes = utils.requireJSON("./config/routes.json", {encoding: 'utf8'}); 

    const baseUrl = routes.baseurl;
    // Crear els punters al parent
    let parent = null;
    routes.pages.forEach((page) => {
        page.parent = parent
        if (page.views != null) {
            page.views.forEach(view => {
                utils.setParentToView(view, page);
            });
        }
    });

    if (!baseUrl) {
        console.log("ERROR: Error de configuració. Es requereix establir un 'baseUrl' en el fitxer de configuració")
        process.exit(1);
    }

    // Comprova si existeix el directori base
    const directoriBase = path.join("./static", baseUrl);
    try {
        fs.statSync(directoriBase);
    } catch(ex) {
        console.error("No s'ha trobat l'arrel de la compilació. Es farà una generació completa.")
        buildOptions.type='all';
    }


    // Remove old compilation: decide what to remove
    let dir = null;
    if (buildOptions.type=='all') {
        // elimina per complet el directori i el torna a crear
        // caldrà generar bundles, pages i database
        try {
            dir = path.resolve(directoriBase);
            fsutils.rmdirSync(dir);
        } catch(ex) {
            console.error("WARNING: No s'han pogut esborrar els directoris");
        }
        // el torna a crear
        try {
            fs.mkdirSync(path.resolve(dir));
            fs.mkdirSync(path.resolve(path.join(dir, "database")));
        } catch(ex) {
            console.error("ERROR: No s'han pogut crear els directoris");
            process.exit(1);
        }
    } else {
         // Remove old database folder
         try {
            dir = path.resolve(path.join("./static", baseUrl, "database"));
            fsutils.rmdirSync(dir);
         } catch(ex) {
             console.error("ERROR: No s'ha pogut esborrar el directori database");
         }
         try {
            fs.mkdirSync(dir);
        } catch(ex) {
            console.error("ERROR: No s'han pogut crear el directori database");
            process.exit(1);
        }
        if(buildOptions.type=='pages') {
            
            // A més caldrà esborrar tots els *.html
            try {
                dir = path.resolve(path.join("./static", baseUrl));
                const files = fs.readdirSync(dir);
                files.forEach((file)=>{
                    if(file.endsWith(".html")) {
                        fs.unlinkSync(path.join(dir, file));
                    }
                });
            } catch(ex) {
                console.error("WARNING: No s'han pogut esborrar els fitxers html antics");
            }

        } else {
            // operacions amb la resta
        }
    }

    // Load all database files (which will be passed to views during rendering process)
    console.log("Reading database files...");
    const dbFiles = fs.readdirSync("./database");
    const database = {};
    let destacatsManual = [];
 
    dbFiles.forEach(file => {
        let name;
        if (file.endsWith(".json")) {
            name = path.basename(file, ".json");
            database[name] = utils.requireJSON("./" + path.join("database", file));
        } else if (file.endsWith(".csv")) {
            name = path.basename(file, ".csv");
            const csvContents = fs.readFileSync("./" + path.join("database", file), "utf8");
            database[name] = utils.parseCsv(csvContents);
        }

        if (name == "inici") {
            destacatsManual = database[name].destacats;
        }

        if (name == "proves") {

            // De la base de dades de proves...
            // Els items que contenen un dir="...", carregar els tots els documents dins documents []

            database.proves.forEach(prova => {
                if (prova.walkdir) {

                    prova.documents = prova.documents || [];
                    const dir2 = path.join("./static", prova.walkdir);
                    console.log("\t\tWalk ", dir2)
                    fs.readdirSync(dir2).forEach(file => {
                        prova.documents.push(dir2.replace("static/", "") + file);
                    });

                }
            });

        }

        // En la base de dades d'avaluacions convertir les url a les url reals
        if (name.startsWith("avaluacions_")) {
            console.log("\t\tNormalitzant url per a taula " + name);
            database[name].forEach(ava => {
                if (ava.documents != null) {
                    ava.documents.forEach((doc) => {
                        if (doc.url != null) {
                            doc.url = utils.normalitzaURL(doc.url);
                        }
                        if (doc.img != null) {
                            doc.img = utils.normalitzaURL(doc.img);
                        }
                    });
                }
            });
        }

        // Ho escriu al directori static (si està configurat en format comprimit) per reduir la mida de l'ajax
        let schemaContent;
        if (config.minify_json) {
            schemaContent = JSON.stringify(database[name]);
        } else {
            schemaContent = JSON.stringify(database[name], null, 2);
        }
        const desti = path.join("./static", baseUrl, "database/" + name + ".json");
        fs.writeFileSync(desti, schemaContent, { encoding: encoding });
        console.log("Escrivint fitxer db: ", desti);

        let information = " ";
        if (Array.isArray(database[name])) {
            information = database[name].length + " rows";
        } else if (utils.isObject(database[name])) {
            information = "keys: " + Object.keys(database[name]).join(", ");
        }
        console.log("\tdatabase: ", name, information);
    });
    database.config = config;
    database.routes = routes;
    database.chunk = function (arr, chunkSize) {
        var R = [];
        for (var i = 0, len = arr.length; i < len; i += chunkSize)
            R.push(arr.slice(i, i + chunkSize));
        return R;
    };
    database.webmaster = config.webmaster;
    const date = new Date();
    database.version = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();


    //************************************************ Determina automàticament destacats */
    // Treim les publicacions més noves (aquesta base no s'ha d'editar a ma, per això el JSON no està formatat)

    database.destacats = [];

    /** Afegeix els destacats introduits manualment per l'usuari **/
    (destacatsManual || []).forEach((destacat) => {
        // Afegeix el flag manual per saber com renderitzar-lo a la presentació
        destacat.manual = true;
        destacat.pubdate = utils.toDate(destacat.pubdate);
        database.destacats.push(destacat);
    });

    // Converteix totes les publicacions a destacats amb una pubdate parsejada
    database.publicacions.forEach(pub => {
        database.destacats.push({
            title: pub.title,
            description: pub.description,
            url: "../" + pub.url,
            target: "_blank",
            pubdate: utils.toDate(pub.pubdate || pub.date),
            img: "../" + pub.img
        });
    });

    /** Orderna pel camp pubdate (tipus Date) descendent */
    database.destacats.sort((d1, d2) => d2.pubdate.getTime() - d1.pubdate.getTime());

    /** Limita la llista a  6 elements **/
    if (database.destacats.length > 6) {
        database.destacats = database.destacats.slice(0, 6);
    }

    fs.writeFileSync("./database/destacats.json", JSON.stringify(database.destacats), { encoding: "utf8" });

    if (buildOptions.type=='db') {
        // Només ha de construir la db, les pàgines no cal modificar-les
        console.log(" > Option onlyDB detected. Skipping pages build");
        process.exit(0);
    }


    console.log("Generant les pàgines...");
    database.development = buildOptions.development;
    // Process all routes 
    const defaultTemplate = routes.template || "simple";

    routes.pages.forEach((page) => {

        const currentTemplate = page.template || defaultTemplate;
        // load the template for every page
        const templatePath = path.join("./templates", currentTemplate, "layout.ejs");
        console.log("Loading template ", templatePath);
        const template = fs.readFileSync(templatePath, { encoding: "utf8" });
        const templateLocation = path.resolve(path.join("./templates", currentTemplate, "layout.ejs"));
        console.log("Template location: ", templateLocation);

        // Load the page contents
        const basename = path.basename(page.ejs, ".ejs");
        database.currentPage = path.join(page.url);
        // read page contents
        let fileStr = fs.readFileSync(path.join("./ejs-pages", page.ejs + ".ejs"), { encoding: "utf8" });

        if (page.views == null || page.views.length == 0) {
            // Cal inserir a la pàgina el breadcrumb
            let breadcrumb = `<nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="index.html"><i class="fas fa-home"></i></a></li> 
          <li class="breadcrumb-item active"> ${page.title_long || page.title} </li>  
        </ol>
        </nav>
        `;
            fileStr = breadcrumb + fileStr;
        }

        database.page = page;
        // A la pàgina cal CREAR tots els views (van en fitxers separats)
        if (page.views) {
            page.views.forEach(view => {
                utils.compileView(view, database);
            });
        }

        // Genera el codi de angular pertinent per gestionar rutes en SPA
        if (page.views && page.views.length > 0) {
            fileStr += `
    <script>
            app.config(["$routeProvider", function ($routeProvider) {
                        $routeProvider`;

            page.views.forEach(view => {
                fileStr += utils.generateRouteForView(view, "");
            });

            fileStr += `
                .otherwise({
                    redirectTo: '/${page.views[0].url}' 
                });
                
            }]);
    </script>`;
        }


        // compile it
        const parts = template.split("</main>");
        const pageTemplate = parts[0] + "\n" + fileStr + "</main>" + parts[1];

        // save into static folder as .html
        // Make sure that this directory is created
        const htmlPath = path.join("./static", baseUrl, page.url + ".html");
        const dirPath = path.basename(htmlPath, ".html");
        page.absoluteUrl = dirPath;
        try {
            //fs.mkdirSync(dirPath);
        } catch (e) { }

        //const compiledPage = ejs.compile(pageTemplate, {filename: templateLocation, name: "layout.ejs"});
        database.view = null;
        let rendered = ejs.render(pageTemplate, database, { filename: templateLocation, name: "layout" });
        console.log("\tWriting html page into ", htmlPath);
        if (config.minify_html) {
            rendered = htmlMinifier(rendered, { minifyJS: true, minifyCSS: true, removeComments: true });
        }
        fs.writeFileSync(htmlPath, rendered, { encoding: encoding });

    });

    if(buildOptions.type=='all') {
        bundleBuilder();
    }

    console.log("All done!");
};