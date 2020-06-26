const siteBuilder = require('./buildtools/sitebuilder');

let type = 'pages';

if(process.argv.indexOf("-onlyDb") > 0) {
    type = 'db'
} else if(process.argv.indexOf("-all") > 0) {
    type = 'all'
}

const buildOptions = {
    type: type,
    production: process.argv.indexOf("-dev") < 0
};

siteBuilder(buildOptions);
