const router = require('express').Router();
const url = require('url');
const uuid4 = require('uuid/v4');

const parseScopeList = (scope) => (scope ? scope : "").split(' ');
const parseUri = (uri) => {
    try {
        const u = url.parse(uri);
        return u.href;
    } catch (e) {
        return null;
    }
};
const EXPIRES_IN = 3600;

class AuthorizationApiErrorResopnse {
    constructor(error, error_description, state) {
        this.error = error;
        this.error_description = error_description;
        this.state = state;
    }
}

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

class TokenApiErrorResopnse {
    constructor(error, error_description) {
        this.error = error;
        this.error_description = error_description;
    }
}

router
    .get('/authorize', (req, res, next) => {
        const responseType = req.query["response_type"];
        const clientId = req.query["client_id"];
        const redirectUri = parseUri(req.query["redirect_uri"]);
        const scopeList = parseScopeList(req.query["scope"]);
        const state = req.query["state"];

        if (responseType === 'code') { //Authorization Code Flow [https://tools.ietf.org/html/rfc6749#section-4.1]
            if (!clientId) {
                res.status(400).json(new AuthorizationApiErrorResopnse('invalid_request', 'parameter client_id required.', state));
            } else {
                const redirectTargetUri = (redirectUri) ? redirectUri : 'http://localhost:3000/client-app/callback';
                const grantCode = uuid4();
                const stateQuery = (state) ? `&state=${state}` : '';
                res.status(302).header('Location', `${redirectTargetUri}?code=${grantCode}${stateQuery}`).send();
            }
        } else if (responseType === 'token') { //Implicit Flow [https://tools.ietf.org/html/rfc6749#section-4.2]
            //TODO: implement

        } else {
            res.status(400).json(new AuthorizationApiErrorResopnse('unsupported_response_type', 'parameter response_type invalid.', state));
        }
    })
    .post('/token', (req, res, next) => {
        const grantType = req.body.grant_type;
        const scopeList = parseScopeList(req.body.scope);

        if (grantType === 'authorization_code') { //Authorization Code Flow [https://tools.ietf.org/html/rfc6749#section-4.1]
            const grantCode = req.body.code;
            const redirectUri = req.body.redirect_uri;
            const clientId = req.body.client_id;

            //TODO: verify grantCode (Validate unchanging between issued grant code and received grant code).
            if (!grantCode) {
                res.status(400).json(new TokenApiErrorResopnse('invalid_request', 'parameter code required.'));
            } else {
                const responseBody = TokenApiSuccessResponse.buildForResourceOwnerPasswordCredentialsFlow(uuid4(), 'bearer', EXPIRES_IN, uuid4());
                res.json(responseBody);
            }

        } else if (grantType === 'password') { //Resource Owner Password Credentials Flow [https://tools.ietf.org/html/rfc6749#section-4.3]
            const username = req.body.username;
            const password = req.body.password;

            if (!username) {
                res.status(400).json(new TokenApiErrorResopnse('invalid_request', 'parameter username required.'));
            } else if (!password) {
                res.status(400).json(new TokenApiErrorResopnse('invalid_request', 'parameter password required.'));
            } else if (username === 'test' && password === 'testtest') {
                const responseBody = TokenApiSuccessResponse.buildForResourceOwnerPasswordCredentialsFlow(uuid4(), 'bearer', EXPIRES_IN, uuid4());
                res.json(responseBody);
            } else {
                res.status(401).send(new TokenApiErrorResopnse('invalid_grant', 'invalid username and password combination.'));
            }

        } else if (grantType === 'client_credentials') { //Client Credential Grant Flow [https://tools.ietf.org/html/rfc6749#section-4.4]
            const responseBody = TokenApiSuccessResponse.buildForClientCredentialFlow(uuid4(), 'bearer', EXPIRES_IN);
            res.json(responseBody);

        } else {
            res.status(400).json(new TokenApiErrorResopnse('invalid_request', 'parameter grant_type invalid.'));
        }
    });

module.exports = router;
