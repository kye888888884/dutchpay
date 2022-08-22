"use strict";

const fs = require("fs");

class UserStorage {

    static #getUserInfo(data, id) {
        const users = JSON.parse(data);
        const idx = users.id.indexOf(id);
        const usersKeys = Object.keys(users);
        const userInfo = usersKeys.reduce((newUser, info) => {
            newUser[info] = users[info][idx];
            return newUser;
        }, {});
        return userInfo;
    }

    static #getUsers(data, isAll, fields) {
        const users = JSON.parse(data);
        if (isAll) return users;

        const newUsers = fields.reduce((newUsers, field) => {
            if (users.hasOwnProperty(field)) {
                newUsers[field] = users[field];
            }
            return newUsers;
        }, {});
        return newUsers;
    }

    static getUsers(isAll, ...fields) {
        const readFile = () => {
            return new Promise((res, rej) => {
                fs.readFile("./src/databases/users.json", "utf-8", (err, data) => {
                    if (err) rej(err);
                    else res(data);
                });
            });
        }
        return readFile()
            .then((data) => {
                return this.#getUsers(data, isAll, fields);
            })
            .catch(console.error);
    };

    static getUserInfo(id) {
        const readFile = () => {
            return new Promise((res, rej) => {
                fs.readFile("./src/databases/users.json", "utf-8", (err, data) => {
                    if (err) rej(err);
                    else res(data);
                });
            });
        }
        return readFile()
            .then((data) => {
                return this.#getUserInfo(data, id);
            })
            .catch(console.error);
    };
        
    static async save(userInfo) {
        const users = await this.getUsers(true);
        console.log(users);
        if (users.id.includes(userInfo.id)) {
            throw "이미 존재하는 아이디입니다.";
        }
        users.id.push(userInfo.id);
        users.name.push(userInfo.name);
        users.pass.push(userInfo.pass);
        const wirteFile = () => {
            return new Promise((res, rej) => {
                fs.writeFile("./src/databases/users.json", JSON.stringify(users), "utf-8", (err) => {
                    if (err) rej(err);
                });
            });
        }
        wirteFile();
        return { success: true };
    }
}

module.exports = UserStorage;