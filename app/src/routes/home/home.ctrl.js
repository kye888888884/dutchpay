"use strict";

const home = (req, res) => {
    res.render("home/index");
};

const login = (req, res) => {
    res.render("login/login");
};

const dutch = (req, res) => {
    res.render("dutch/dutch");
}

module.exports = {
    home,
    login,
    dutch
};