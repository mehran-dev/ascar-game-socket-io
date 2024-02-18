//this is the file we will run with Node/nodemon
//require('./expressStuff/expressMain')

const app = require("./servers").app;

require("./socketStuff/socketMain");
module.exports = app;
