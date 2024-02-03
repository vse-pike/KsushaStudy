const uuid = require("uuid");

class UserDataBuilder {
    constructor() {
        this.login = '';
        this.password = '';
        this.name = '';
        this.role = '';
    }

    withLogin(login) {
        this.login = login;
        return this;
    }

    withPassword(password) {
        this.password = password;
        return this;
    }

    withName(name) {
        this.name = name;
        return this;
    }

    withRole(role) {
        this.role = role;
        return  this;
    }

    build() {
        return {
            login: this.login,
            password: this.password,
            name: this.name,
            role: this.role
        }
    }
}

class UserRecordBuilder {
    constructor() {
        this.UserId = '';
        this.Name = '';
        this.Login = '';
        this.PasswordHash = '';
        this.Role = '';
    }

    withUserId(UserId) {
        this.UserId = UserId;
        return this;
    }

    withName(Name) {
        this.Name = Name;
        return this;
    }

    withLogin(Login) {
        this.Login = Login;
        return this;
    }

    withPasswordHash(PasswordHash) {
        this.PasswordHash = PasswordHash;
        return  this;
    }

    build() {
        return {
            UserId:  this.UserId,
            Name: this.Name,
            Login: this.Login,
            PasswordHash: this.PasswordHash,
            Role: this.Role
        }
    }
}


class UserAuthBuilder{
    constructor(){
        this.login = "";
        this.password= "";
    }

    withLogin(login){
        this.login = login;
        return this;
    }

    withPassword(password){
        this.password = password;
        return this;
    }

    build(){
        return {
            login: this.login,
            password: this.password
        }
    }
}


class UserTokenBuilder{
    constructor() {
        this.UserId = '';
        this.Token = '';
        this.ExpirationDateTime = '';
    }

    withUserId(UserId){
        this.UserId = UserId;
        return this;
    }
    withToken(Token){
        this.Token = Token;
        return this;
    }
    withExpirationDateTime(ExpirationDateTime){
        this.ExpirationDateTime = ExpirationDateTime;
        return this;
    }
}

module.exports = {
    UserDataBuilder,
    UserRecordBuilder,
    UserAuthBuilder,
    UserTokenBuilder
}
