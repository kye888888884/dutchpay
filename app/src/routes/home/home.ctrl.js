"use strict";

const home = (req, res) => {
    res.render("home/index");
};

const dutch = (req, res) => {
    res.render("home/dutch");
}

module.exports = {
    home,
    dutch
};