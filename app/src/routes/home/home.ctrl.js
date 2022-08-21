"use strict";

const UserStorage = require("../../models/UserStorage");

const output = {
    home: (req, res) => {
        res.render("home/index");
    },
    login: (req, res) => {
        res.render("login/login");
    },
    dutch: (req, res) => {
        res.render("dutch/dutch");
    },
}

const process = {
    login: (req, res) => {
        const id = req.body.id,
            pass = req.body.pass;
        
        const users = UserStorage.getUsers("id", "pass");

        const response = {};
        if (users.id.includes(id)) {
            const idx = users.id.indexOf(id);
            if (users.pass[idx] === pass) {
                response.success = true;
                return res.json(response);
            }
        }
        
        response.success = false;
        response.msg = "로그인 실패";
        return res.json(response);
    },
}

module.exports = {
    output,
    process,
};