'use strict';

const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");

const app = express();
dotenv.config();

// setting app
app.set("views", "./src/views");
app.set("view engine", "ejs"); // ejs is templete view engine; embedded javascript template.

// routing
const home = require("./src/routes/home"); // import index.js -> route

const accessLogStream = require("./src/config/log");

// middleware
app.use(express.static(`${__dirname}/src/public`)) // it gives other files access to public directory.
app.use(express.json()); // body-parser.
app.use(express.urlencoded({ extended: true})); // to solve the url problem.
app.use(morgan("common", { stream: accessLogStream })); // log sign in/out

app.use("/", home); // register middlewares.

module.exports = app;