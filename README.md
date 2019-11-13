# IAQSE-WEB2
This project uses the following technologies

For the backend
- NodeJS
- EJS Templates

For the frontend
- AngularJS
- CSS Bootstrap4 

# Install
You will need nodejs, npm and git installed in your computer.

`git clone https://github.com/jmulet/IAQSE-WEB2.git`

`cd IAQSE-WEB2`

`npm install`

 Please note that the static/documents folder nor the cat/ are included in the distribution.

# Configuration
The directory /config has two files
### config.json
In this file, the encoding of the generated static content can be defined "encoding": "latin1" or "utf-8". 

### routes.json
In this file, the tree structure of your site can be defined. The site is organized into pages. Every page can have many views and,
in turn, a view can also contain views.

The difference between page and view is that page is a html page whereas a view is an ajax request (angularjs views).

Breadcrumbs are automatically generated from routes.json.

# Database
Database tables are defined as json files into the database/ directory. You can modify them and run a build to generate the static web content.

# EJS PAGES
The pages that are declared for each route into the routes.json are created into the directory ejs-pages/

The server-side template engine is EJS (Embedded Java Script). From these templates, every database json file is accessible as a 
javascript object.

# Build
In order to compile the ejs-pages into static content, the following command must be run
`node ./build.js`

# Local server
A local server build with express js can be used during development. 
`node ./server.js &` 

You can access to the pages opening a web page in the browser at address `localhost:3000/cat2` where `cat2` is the baseUrl defined in the config.json file.

