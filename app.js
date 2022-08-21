'use strict';

const express = require('express');
const app = express();

// setting app
app.set("views", "./views");
app.set("view engine", "ejs"); // ejs is templete view engine; embedded javascript template

// middleware
const home = require("./routes/home"); // import index.js -> route
app.use("/", home);

module.exports = app;