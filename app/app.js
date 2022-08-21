'use strict';

const express = require('express');
const app = express();

// setting app
app.set("views", "./src/views");
app.set("view engine", "ejs"); // ejs is templete view engine; embedded javascript template.

// middleware
const home = require("./src/routes/home"); // import index.js -> route
app.use("/", home);
app.use(express.static(`${__dirname}/src/public`)) // it gives other files access to public directory.

module.exports = app;