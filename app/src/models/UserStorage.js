"use strict";

const db = require("../config/db");

class UserStorage {
    static getUserInfo(id) {
        return new Promise((res, rej) => {
            const query = "SELECT * FROM users WHERE id = ?;";
            db.query(query, [id], (err, data) => {
                if (err) rej(err);
                res(data[0]);
            });
        });
    }
        
    static async save(userInfo) {
        return new Promise((res, rej) => {
            const query = "INSERT INTO users(id, name, pass) VALUES(?, ?, ?)";
            db.query(query, [userInfo.id, userInfo.name, userInfo.pass], (err) => {
                if (err) rej(`${err}`);
                res({ success: true });
            });
        });
    }
}

module.exports = UserStorage;