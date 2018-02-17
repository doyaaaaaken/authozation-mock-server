const fs = require('fs');
const jwt = require('jsonwebtoken');

class JWTFactory {
    static init() {
        this.cert = fs.readFileSync('conf/jwtRS256.key');
    }

    static createToken(nonce, at_hash) {
        let claim = {
            iss: "http://localhost:3000/",
            sub: "AItOawmwtWwcT0k51BayewNvutrJUqsvl6qs7A4",
            aud: "client-id-123",
            exp: 1558882862061,
            iat: Number(new Date()),
            auth_time: Number(new Date())
        };
        if(nonce) {
            claim.nonce = nonce;
        }
        if(at_hash) {
            claim.at_hash = at_hash;
        }
        return jwt.sign(claim, this.cert, { algorithm: 'RS256'});
    }
}

module.exports = JWTFactory
