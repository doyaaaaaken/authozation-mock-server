const router = require('express').Router();
const uuid4 = require('uuid/v4');

const AuthorizationApiErrorResopnse = require('../../models/openid-connect/AuthorizationApiErrorResopnse');
const TokenApiSuccessResponse = require('../../models/openid-connect/TokenApiSuccessResponse');
const TokenApiErrorResopnse = require('../../models/openid-connect/TokenApiErrorResopnse');
const JWTFactory = require('../../models/openid-connect/JWTFactory');
JWTFactory.init();

const preDefinedScopeList = ["openid", "profile", "email", "address", "phone"];
const CLIENT_CALLBACK_URI = 'http://localhost:3000/client-app/openid-connect/callback';
const EXPIRES_IN = 3600;

const parseScopeList = (scope) => (scope ? scope : "").split(' ').filter((value) => {
    if (preDefinedScopeList.includes(value)) {
        return true;
    } else {
        console.warn(`scope value '${value}' is ignored!! Because it's not defined value.`);
        return false;
    }
});

const responseByAuthorizeEndpoint = (res, scope, responseType, clientId, redirectUri, state, prompt, nonce) => {
    const scopeList = parseScopeList(scope);

    if (!scopeList) {
        res.status(400).json(new AuthorizationApiErrorResopnse('invalid_request', 'Bad request: \'scope\' parameter is REQUIRED.', state));
    } else if (!scopeList.includes('openid')) {
        res.status(400).json(new AuthorizationApiErrorResopnse('invalid_request', 'scope parameter list must contains \'openid\' value.', state));
    } else {
            //Authentication Code Flow (http://openid-foundation-japan.github.io/openid-connect-core-1_0.ja.html#CodeFlowAuth)
        if (responseType === 'code') {
            if (!clientId) {
                res.status(400).json(new AuthorizationApiErrorResopnse('invalid_request', 'Bad request: \'client_id\' parameter is REQUIRED.', state));
            } else if (!redirectUri) {
                res.status(400).json(new AuthorizationApiErrorResopnse('invalid_request', 'Bad request: \'redirect_uri\' parameter is REQUIRED.', state));
            } else if (prompt === "none") {
                res.status(302).header('Location', new AuthorizationApiErrorResopnse('login_required', 'Bad request: \'prompt\' parameter is \'none\', and user is not authenticated.', state).toUriWithFragment(redirectUri)).send();
            } else {
                const grantCode = uuid4();
                const stateQuery = (state) ? `&state=${state}` : '';
                res.status(302).header('Location', `${redirectUri}?code=${grantCode}${stateQuery}`).send();
            }

            //Implicit Code Flow (http://openid-foundation-japan.github.io/openid-connect-core-1_0.ja.html#CodeFlowAuth)
        } else if (responseType === 'id_token' || responseType === 'id_token token') {
            if (!clientId) {
                res.status(400).json(new AuthorizationApiErrorResopnse('invalid_request', 'Bad request: \'client_id\' parameter is REQUIRED.', state));
            } else if (!redirectUri) {
                res.status(400).json(new AuthorizationApiErrorResopnse('invalid_request', 'Bad request: \'redirect_uri\' parameter is REQUIRED.', state));
            } else if (!nonce) {
                res.status(400).json(new AuthorizationApiErrorResopnse('invalid_request', 'Bad request: \'nonce\' parameter is REQUIRED.', state));
            } else if (prompt === "none") {
                res.status(302).header('Location', new AuthorizationApiErrorResopnse('login_required', 'Bad request: \'prompt\' parameter is \'none\', and user is not authenticated.', state).toUriWithFragment(redirectUri)).send();
            } else {
                const accessTokenQuery = (responseType === "id_token") ? '' : `access_token=${uuid4()}`;
                const tokenTypeQuery = '&token_type=Bearer';
                const idTokenQuery = `&id_token=${JWTFactory.createToken(nonce)}`;
                const stateQuery = (state) ? `&state=${state}` : '';
                const expiresInQuery = '&expires_in=3600';
                res.status(302).header('Location', `${redirectUri}#${accessTokenQuery}${tokenTypeQuery}${idTokenQuery}${stateQuery}${expiresInQuery}`).send();
            }

            //Hybrid Flow (http://openid-foundation-japan.github.io/openid-connect-core-1_0.ja.html#HybridFlowAuth)
        } else if (responseType === 'code id_token' || responseType === 'code token' || responseType === 'code id_token token') {
            if (!clientId) {
                res.status(400).json(new AuthorizationApiErrorResopnse('invalid_request', 'Bad request: \'client_id\' parameter is REQUIRED.', state));
            } else if (!redirectUri) {
                res.status(400).json(new AuthorizationApiErrorResopnse('invalid_request', 'Bad request: \'redirect_uri\' parameter is REQUIRED.', state));
            } else if (prompt === "none") {
                res.status(302).header('Location', new AuthorizationApiErrorResopnse('login_required', 'Bad request: \'prompt\' parameter is \'none\', and user is not authenticated.', state).toUriWithFragment(redirectUri)).send();
            } else {
                const grantCode = uuid4();
                const accessTokenQuery = responseType.includes("token") ? `&access_token=${uuid4()}`: '';
                const tokenTypeQuery = responseType.includes("token") ? '&token_type=Bearer': '';
                const idTokenQuery = responseType.includes("id_token") ? `&id_token=${JWTFactory.createToken()}` : '';
                const stateQuery = (state) ? `&state=${state}` : '';
                const expiresInQuery = '&expires_in=3600';
                res.status(302).header('Location', `${redirectUri}#code=${grantCode}${accessTokenQuery}${tokenTypeQuery}${idTokenQuery}${stateQuery}${expiresInQuery}`).send();
            }

        } else {
            res.status(400).json(new AuthorizationApiErrorResopnse('invalid_request', `Bad request: \'response_type\' parameter ${responseType} is invalid.`, state));
        }
    }
};

router
    .get('/authorize', (req, res, next) => {
        const scope = req.query["scope"];
        const responseType = req.query["response_type"];
        const clientId = req.query["client_id"];
        let redirectUri = req.query["redirect_uri"];
        const state = req.query["state"];
        const prompt = req.query["prompt"];
        const nonce = req.query["nonce"];

        redirectUri = redirectUri ? redirectUri : CLIENT_CALLBACK_URI;

        responseByAuthorizeEndpoint(res, scope, responseType, clientId, redirectUri, state, prompt, nonce);
    })
    .post('/authorize', (req, res, next) => {
        const scope = req.body.scope;
        const responseType = req.body.response_type;
        const clientId = req.body.client_id;
        let redirectUri = req.body.redirect_uri;
        const state = req.body.state;
        const prompt = req.body.prompt;
        const nonce = req.body.nonce;

        redirectUri = redirectUri ? redirectUri : CLIENT_CALLBACK_URI;

        responseByAuthorizeEndpoint(res, scope, responseType, clientId, redirectUri, state, prompt, nonce);
    })
    .get('/authorization-confirm', (req, res, next) => {
        const flowType = req.query['x-flow']; //Specific in this app, not declared in RFC.
        const responseType = (flowType === 'authorizationCode') ? 'code' : (flowType === 'implicit') ? 'id_token token' : 'code id_token token';
        const redirectUriPath = (flowType === 'authorizationCode') ? 'authorization-code-flow' : (flowType === 'implicit') ? 'implicit-flow' : 'hybrid';
        const nonce = uuid4();
        res.render('openid-connect-confirm', { title: 'OpenID Connect Confirm', responseType: responseType, redirectUriPath: redirectUriPath, nonce: nonce});
    })
    .post('/token', (req, res, next) => {
        const grantType = req.body.grant_type;
        const grantCode = req.body.code;

        //Authorization Code Flow and Hybrid Flow.
        if (grantType === 'authorization_code') {
            const idToken = JWTFactory.createToken();
            const responseBody = TokenApiSuccessResponse.build(uuid4(), 'bearer', EXPIRES_IN, uuid4(), idToken);
            res.json(responseBody);

        } else {
            res.status(400).json(new TokenApiErrorResopnse('invalid_request', `grant_type parameter ${grantType} invalid.`));
        }
    });

module.exports = router;
