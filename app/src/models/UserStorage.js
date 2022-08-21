"use strict"

class UserStorage {
    static #users = {
        id: ["hi", "hello", "kyh"],
        pass: ["123", "1234", "321"],
        name: ["영현", "ABC", "안녕하세요"]
    };

    static getUsers(...fields) {
        const users = this.#users;
        const newUsers = fields.reduce((newUsers, field) => {
            if (users.hasOwnProperty(field)) {
                newUsers[field] = users[field];
            }
            return newUsers;
        }, {});
        return newUsers;
    };
}

module.exports = UserStorage;