
const utilities = require('./utilities');
const Repository = require('./models/repository');
const Token = require('./models/token');
let repository = new Repository(new Token());

let tokenLifeDuration = require("./serverVariables").get("main.token.lifeDuration");

class TokenManager {
    static create(user) {
        let token = new Token().create(user);
        token.Expire_Time = utilities.nowInSeconds() + tokenLifeDuration;
        console.log("User " + token.Username + " logged in");
        repository.add(token);
        return token;
    }
    static logout(userId) {
        let tokens = repository.getAll();
        let index = 0;
        let indexToDelete = [];
        for (let token of tokens) {
            if (token.UserId == userId) {
                console.log("User " + token.Username + " logged out");
                indexToDelete.push(index);
            }
            index++;
        }
        repository.removeByIndex(indexToDelete);
    }
    static clean() {
        let tokens = repository.getAll();
        let now = utilities.nowInSeconds();
        let index = 0;
        let indexToDelete = [];
        for (let token of tokens) {
            if (token.Expire_Time < now) {
                console.log("Access token of user " + token.Username + " expired");
                indexToDelete.push(index);
            }
            index++;
        }
        if (index > 0)
            repository.removeByIndex(indexToDelete);
    }
    static find(access_token) {
        let token = repository.findByField('Access_token', access_token);
        if (token != null) {
            // renew expiration date
            token.Expire_Time = utilities.nowInSeconds() + tokenLifeDuration;
            repository.update(token);
            return token;
        }
        return null;
    }
    static requestAuthorized(req) {
        if (req.headers["authorization"] != undefined) {
            // Extract bearer token from head of the http request
            let token = req.headers["authorization"].replace('Bearer ', '');
            return (this.find(token) != null);
        }
        return false;
    }
}

// periodic cleaning of expired tokens
log(BgWhite, FgBlack,"Periodic tokens cache cleaning process started...");
setInterval(TokenManager.clean, tokenLifeDuration * 1000);
module.exports = TokenManager;