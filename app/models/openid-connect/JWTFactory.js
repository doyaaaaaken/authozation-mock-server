const fs = require('fs');
const jwt = require('jsonwebtoken');

class JWTFactory {
    static init() {
        this.cert = fs.readFileSync('conf/jwtRS256.key');
    }

    //TODO: Create correct format JWT Token.
    static createToken() {
        return jwt.sign({ foo: 'bar' }, this.cert, { algorithm: 'RS256'});
    }
}

module.exports = JWTFactory
