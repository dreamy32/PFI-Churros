const Model = require('./model');
module.exports =
    class Token extends Model {
        constructor() {
            super();
        }
        create(user = null) {
            let token = {};
            if (user) {
                token.Id = 0;
                token.Access_token = makeToken(user.Email);
                token.UserId = user.Id;
                token.Username = user.Name;
            }
            return token;
        }
    }

function makeToken(text) {
    const crypto = require('crypto');
    const algorithm = 'aes-256-cbc';
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    function encrypt(text) {
        let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return {
            iv: iv.toString('hex'),
            encryptedData: encrypted.toString('hex')
        };
    }
    return encrypt(text).encryptedData;
}
