const router = require('express').Router();
const uuid4 = require('uuid/v4');

const AuthorizationApiErrorResopnse = require('../../models/openid-connect/AuthorizationApiErrorResopnse');

const preDefinedScopeList = ["openid", "profile", "email", "address", "phone"];

const parseScopeList = (scope) => (scope ? scope : "").split(' ').filter((value) => {
    if (preDefinedScopeList.includes(value)) {
        return true;
    } else {
        console.warn(`scope value '${value}' is ignored!! Because it's not defined value.`);
        return false;
    }
});

const responseByAuthorizeEndpoint = (res, scope, responseType, clientId, redirectUri, state, prompt) => {
    const scopeList = parseScopeList(scope);

    if (!scopeList) {
        res.status(400).json(new AuthorizationApiErrorResopnse('invalid_request', 'Bad request: \'scope\' parameter is REQUIRED.', state));
    } else if (!scopeList.includes('openid')) {
        res.status(400).json(new AuthorizationApiErrorResopnse('invalid_request', 'scope parameter list must contains \'openid\' value.', state));
    } else {
        if (!responseType) {
            res.status(400).json(new AuthorizationApiErrorResopnse('invalid_request', 'Bad request: \'response_type\' parameter is REQUIRED.', state));

            //Authentication Code Flow (http://openid-foundation-japan.github.io/openid-connect-core-1_0.ja.html#CodeFlowAuth)
        } else if (responseType === 'code') {
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
            } else {
                //TODO: Implement Implicit Code Flow.
                res.status(302).header('Location', '').send();
            }

        } else {
            res.status(400).json(new AuthorizationApiErrorResopnse('invalid_request', '\'scope\' parameter must have value \'code\' in authorization code flow.', state));
        }
    }
};

router
    .get('/authorize', (req, res, next) => {
        const scope = req.query["scope"];
        const responseType = req.query["response_type"];
        const clientId = req.query["client_id"];
        const redirectUri = req.query["redirect_uri"];
        const state = req.query["state"];
        const prompt = req.query["prompt"];

        responseByAuthorizeEndpoint(res, scope, responseType, clientId, redirectUri, state, prompt);
    })
    .post('/authorize', (req, res, next) => {
        const scope = req.body.scope;
        const responseType = req.body.response_type;
        const clientId = req.body.client_id;
        const redirectUri = req.body.redirect_uri;
        const state = req.body.state;
        const prompt = req.query["prompt"];

        responseByAuthorizeEndpoint(res, scope, responseType, clientId, redirectUri, state, prompt);
    })
    .post('/token', (req, res, next) => {
        //TODO: implement (http://openid-foundation-japan.github.io/openid-connect-core-1_0.ja.html#TokenEndpoint)
        const grantType = req.body.grant_type;
        if (grantType !== 'authorization_code') {
            res.status(400).send("grant_type parameter must be 'authorization_code'.");
        } else {
            res.send('');
        }
    });

module.exports = router;
