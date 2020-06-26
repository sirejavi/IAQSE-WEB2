/**
 * Crea els bundles (fitxers minificats que combinen diversos js o css)
 */
const UglifyJS = require("uglify-js");
const uglifycss = require('uglifycss');
const path = require("path");
const fs = require("fs");

const routes = require("../config/routes.json");
const baseurl = routes.baseurl;
const config = require("../config/config.json");

const processBundle = process.argv.slice(2)[0];

module.exports = function () {

    // Minifica i concatena cada
    config.bundles.forEach((bundle, idx) => {
        let bundleCode = "";
        if (!processBundle || processBundle == (idx + 1)) {
            console.log("* Starting bundle " + bundle.output + "." + bundle.type);
            bundle.inputs.forEach((inputFile) => {
                console.log("\t Processing bundle " + inputFile);
                let code = fs.readFileSync(inputFile, "utf8");
                if (bundle.minify) {
                    if (bundle.type == "js") {
                        const result = UglifyJS.minify(code);
                        if (result.error) {
                            console.log("\t\t" + result.error);
                        }
                        code = result.code;
                    } else if (bundle.type == "css") {

                        code = uglifycss.processString(code,
                            { maxLineLen: 500, expandVars: true });

                    }
                }
                bundleCode += code + "\n";
            });
            const outputFile = path.resolve(path.join("static", baseurl, bundle.output + "." + bundle.type));
            console.log("\t Writing file ", outputFile);
            fs.writeFileSync(outputFile, bundleCode, "utf8")
        } else {
            console.log("* skipped bundle " + bundle.output + "." + bundle.type);
        }
        console.log("");

    });

    console.log("All done!");
}