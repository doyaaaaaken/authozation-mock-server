const router = require('express').Router();
const url = require('url');
const uuid4 = require('uuid/v4');

const AuthorizationApiErrorResopnse = require('../../models/oauth2/AuthorizationApiErrorResopnse');
const TokenApiSuccessResponse = require('../../models/oauth2/TokenApiSuccessResponse');
const TokenApiErrorResopnse = require('../../models/oauth2/TokenApiErrorResopnse');

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
const CLIENT_CALLBACK_URI = 'http://localhost:3000/client-app/oauth2/callback';

router
    .get('/authorization-confirm', (req, res, next) => {
        res.render('oauth2-confirm', { title: 'OAuth2 Confirm' });
    })
    .get('/authorize', (req, res, next) => {
        const responseType = req.query["response_type"];
        const clientId = req.query["client_id"];
        const parsedRedirectUri = parseUri(req.query["redirect_uri"]);
        const redirectUri = (parsedRedirectUri) ? parsedRedirectUri : CLIENT_CALLBACK_URI;
        const scopeList = parseScopeList(req.query["scope"]);
        const state = req.query["state"];

        if(!redirectUri) {
            res.status(400).json(new AuthorizationApiErrorResopnse('invalid_request', 'parameter redirect_uri invalid.', state));

        } else if (responseType === 'code') { //Authorization Code Flow [https://tools.ietf.org/html/rfc6749#section-4.1]
            if (!clientId) {
                res.status(400).json(new AuthorizationApiErrorResopnse('invalid_request', 'parameter client_id required.', state));
            } else {
                const grantCode = uuid4();
                const stateQuery = (state) ? `&state=${state}` : '';
                res.status(302).header('Location', `${redirectUri}?code=${grantCode}${stateQuery}`).send();
            }
        } else if (responseType === 'token') { //Implicit Flow [https://tools.ietf.org/html/rfc6749#section-4.2]
            if (!clientId) {
                res.status(400).json(new AuthorizationApiErrorResopnse('invalid_request', 'parameter client_id required.', state));
            } else {
                const accessToken = uuid4();
                const tokenTypeQuery = '&token_type=bearer';
                const stateQuery = (state) ? `&state=${state}` : '';
                const expiresInQuery = '&expires_in=3600';
                res.status(302).header('Location', `${redirectUri}#access_token=${accessToken}${tokenTypeQuery}${stateQuery}${expiresInQuery}`).send();
            }

        } else {
            res.status(302).header('Location', new AuthorizationApiErrorResopnse('unsupported_response_type', 'parameter response_type invalid.', state).toUri(redirectUri)).send();
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

        } else if (grantType === 'refresh_token') { //Refreshing an access token [https://tools.ietf.org/html/rfc6749#section-6]
            const refreshToken = req.body.refresh_token;

            if(!refreshToken) {
                res.status(400).json(new TokenApiErrorResopnse('invalid_request', 'parameter refresh_token required.'));
            } else {
                const responseBody = TokenApiSuccessResponse.buildForResourceOwnerPasswordCredentialsFlow(uuid4(), 'bearer', EXPIRES_IN, uuid4());
                res.json(responseBody);
            }
        } else if (grantType === 'client_credentials') { //Client Credential Grant Flow [https://tools.ietf.org/html/rfc6749#section-4.4]
            const responseBody = TokenApiSuccessResponse.buildForClientCredentialFlow(uuid4(), 'bearer', EXPIRES_IN);
            res.json(responseBody);

        } else {
            res.status(400).json(new TokenApiErrorResopnse('invalid_request', 'parameter grant_type invalid.'));
        }
    });

module.exports = router;
