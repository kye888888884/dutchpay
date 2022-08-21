"use strict";

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

const users = {
    id: ["hi", "hello", "kyh"],
    pass: ["123", "1234", "321"]
}

const process = {
    login: (req, res) => {
        const id = req.body.id,
            pass = req.body.pass;
        
        if (users.id.includes(id)) {
            const idx = users.id.indexOf(id);
            if (users.pass[idx] === pass) {
                return res.json({
                    success: true,
                })
            }
        }

        return res.json({
            success: false,
            msg: "로그인 실패"
        })
    },
}

module.exports = {
    output,
    process,
};