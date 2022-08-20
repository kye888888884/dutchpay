'use strict';

const express = require('express');
const app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

const server = app.listen(3000, () => {
  console.log(`Start server: localhost 3000`);
});

app.get('/', function (req, res) {
  res.render("index.html");
});