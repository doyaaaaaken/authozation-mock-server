const router = require('express').Router();
const request = require('request');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const validateIdToken = (idToken) => {
    const cert = fs.readFileSync('conf/jwtRS256.key.pub');

    return jwt.verify(idToken, cert, {algorithms: 'RS256', issuer: 'http://localhost:3000/', audience: 'cid-xyz01234'}, (err, decoded) => {
        return !err;
    });
};

router
    .get('/', (req, res, next) => {
        res.render('openid-connect', {title: 'OpenID Connect Sample'});
    })
    //This callback endpoint is called by Authorization Code Flow.
    .get('/callback/authorization-code-flow', (req, res, next) => {
        const code = req.query["code"];
        const state = req.query["state"];

        const options = {
            uri: 'http://localhost:3000/auth-server/openid-connect/token',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            form: {
                "grant_type": "authorization_code",
                "code": (code) ? code : null,
                "redirect_uri": "http://localhost:3000/client-app/openid-connect/callback/authorization-code-flow",
                "client_id": "cid-xxx-12345"
            }
        };
        request.post(options, (error, response, body) => {
            if (error) {
                res.render('openid-connect-result', {result: 'ERROR'});
            } else {
                if (response.statusCode !== 200) {
                    res.render('openid-connect-result', {result: 'Failed', description: JSON.stringify(response.body), isImplicitFlow: false});
                } else {
                    const idToken = JSON.parse(response.body).id_token;
                    if(validateIdToken(idToken)) {
                        res.render('openid-connect-result', {result: 'Success', description: JSON.stringify(response.body), isImplicitFlow: false});
                    } else {
                        res.render('openid-connect-result', {result: 'Failed (Id Token invalid)', description: JSON.stringify(response.body), isImplicitFlow: false});
                    }
                }
            }
        });
    })
    //This callback endpoint is called by Implicit Flow.
    .get('/callback/implicit-flow', (req, res, next) => {
        res.render('openid-connect-result', {result: '', description: '', isImplicitFlow: true});
    });

module.exports = router;
