const Model = require('./model');
module.exports = 
class User extends Model{
    constructor()
    {
        super();
        this.Name = "";
        this.Email = "";
        this.Password = "";
        this.Created = 0;
        this.AvatarGUID = "";
        this.key = "Email";
        this.VerifyCode = 0;

        this.addValidator('Name','string');
        this.addValidator('Email','email');
        this.addValidator('Password','string');
        this.addValidator('Created','integer');
    }
}