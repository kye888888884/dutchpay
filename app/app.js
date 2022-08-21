'use strict';

const express = require("express");
const app = express();

// setting app
app.set("views", "./src/views");
app.set("view engine", "ejs"); // ejs is templete view engine; embedded javascript template.

// middleware
const home = require("./src/routes/home"); // import index.js -> route
app.use(express.static(`${__dirname}/src/public`)) // it gives other files access to public directory.
app.use(express.json()); // body-parser.
app.use(express.urlencoded({ extended: true})); // to solve the url problem.

app.use("/", home); // it must be executed at last.

module.exports = app;