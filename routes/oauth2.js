const router = require('express').Router();

const parseScopeList = (scope) => (scope ? scope : "").split(' ');

class TokenApiSuccessResponse {

    constructor(access_token, token_type, expires_in, refresh_token) {
        this.access_token = access_token;
        this.token_type = token_type;
        this.expires_in = expires_in;
        this.refresh_token = refresh_token;
    }

    static buildForResourceOwnerPasswordCredentialsFlow(access_token, token_type, expires_in, refresh_token) {
        return new TokenApiSuccessResponse(access_token, token_type, Number(expires_in), refresh_token);
    }

    static buildForClientCredentialFlow(access_token, token_type, expires_in) {
        return new TokenApiSuccessResponse(access_token, token_type, Number(expires_in), null);
    }
}

const EXPIRES_IN = 3600;
//TODO: generate access token from uuid.

//TODO: implement flow 1.
router
    .get('/authorize', (req, res, next) => {
        //TODO: implement all flows
        const scope = req.query["scope"]; //ex.) "openid%20profile"
        const responseType = req.query["response_type"]; //ex.) "code"
        const clientId = req.query["client_id"]; //ex.) "s6BhdRkqt3"
        const redirectUri = req.query["redirect_uri"]; //ex.) "https%3A%2F%2Fclient.example.org%2Fcb"
        const state = req.query["state"]; //ex.) "af0ifjsldkj"

        // createResponseData(res, scope, responseType, clientId, redirectUri, state);
    })
    .post('/token', (req, res, next) => {
        const grantType = req.body.grant_type;
        const scopeList = parseScopeList(req.body.scope);

        if (grantType === 'authorization_code') { //Authorization Code Flow [https://tools.ietf.org/html/rfc6749#section-4.1]

        } else if (grantType === 'password') { //Resource Owner Password Credentials Flow [https://tools.ietf.org/html/rfc6749#section-4.3]
            const username = req.body.username;
            const password = req.body.password;

            //TODO: implement error resopnse
            if(!username) {
                res.status(400).send("parameter username required.");
            } else if (!password) {
                res.status(400).send("parameter username required.");
            } else if (username === 'test' && password === 'testtest') {
                const responseBody = TokenApiSuccessResponse.buildForResourceOwnerPasswordCredentialsFlow('xxxxxx', 'bearer', EXPIRES_IN, 'xxxxx');
                res.json(responseBody);
            } else {
                res.status(401).send('');
            }

        } else if (grantType === 'client_credentials') { //Client Credential Grant Flow [https://tools.ietf.org/html/rfc6749#section-4.4]
            const responseBody = TokenApiSuccessResponse.buildForClientCredentialFlow('xxx-acc-token', 'bearer', EXPIRES_IN);
            res.json(responseBody);

        } else {
            res.status(400).send("grant_type parameter wrong.");
        }
    });


module.exports = router;
