const router = require('express').Router();

//TODO: Write UT
const validate = (scopeList, responseType, clientId, redirectUri, state) => {
    if(!scopeList) {
        return { status: 400, msg: "Bad request: 'scope' parameter is REQUIRED." };
    } else if (!scopeList.includes('openid')) {
        return { status: 400, msg: "scope parameter list must contains 'openid' value." };
    }
    if(!responseType) {
        return { status: 400, msg: "Bad request: 'response_type' parameter is REQUIRED." };
    } else if (responseType !== 'code') {
        //TODO: Support Implicit flow
        return { status: 400, msg: "'scope' parameter must have value 'code' in authorization code flow." };
    }
    if(!clientId) {
        return { status: 400, msg: "Bad request: 'client_id' parameter is REQUIRED." };
    }
    if(!redirectUri) {
        return { status: 400, msg: "Bad request: 'redirect_uri' parameter is REQUIRED." };
    }

    return { status: 302, msg: `Receive request params.
                scope = ${scopeList}
                response_type = ${responseType}
                client_id = ${clientId}
                redirect_uri = ${redirectUri}
                state = ${state}`};
};

const parseScopeList = (scope) => (scope ? scope : "").split(' ');

const createResponseData = (res, scope, responseType, clientId, redirectUri, state) => {
    const scopeList = parseScopeList(scope);
    const responseParams = validate(scopeList, responseType, clientId, redirectUri, state);
    console.log(responseParams.msg);
    //TODO: change response to officially format. (http://openid-foundation-japan.github.io/openid-connect-core-1_0.ja.html#AuthResponse)
    res.status(responseParams.status).send(responseParams.msg);
};



class TokenApiSuccessResponse {

    constructor(access_token, token_type, expires_in) {
        this.access_token = access_token;
        this.token_type = token_type;
        this.expires_in = expires_in;
    }

    static buildForClientCredentialFlow(access_token, token_type, expires_in) {
        return new TokenApiSuccessResponse(access_token, token_type, Number(expires_in));
    }
}

//TODO: generate access token from uuid.


//TODO: implement flow 1.
//TODO: implement flow 2.
//TODO: implement flow 3.
router
    .get('/authorize', (req, res, next) => {
        const scope = req.query["scope"]; //ex.) "openid%20profile"
        const responseType = req.query["response_type"]; //ex.) "code"
        const clientId = req.query["client_id"]; //ex.) "s6BhdRkqt3"
        const redirectUri = req.query["redirect_uri"]; //ex.) "https%3A%2F%2Fclient.example.org%2Fcb"
        const state = req.query["state"]; //ex.) "af0ifjsldkj"

        createResponseData(res, scope, responseType, clientId, redirectUri, state);
    })
    .post('/token', (req, res, next) => {
        const grantType = req.body.grant_type;
        const scopeList = parseScopeList(req.body.scope);

        //(Client Credential Grant Flow)[https://tools.ietf.org/html/rfc6749#section-4.4]
        if(grantType === 'client_credentials') {
            const responseBody = TokenApiSuccessResponse.buildForClientCredentialFlow('xxx-acc-token', 'bearer', 3600);
            res.json(responseBody);
        } else {
            res.status(400).send("grant_type parameter must be 'authorization_code'.");
        }
    });


module.exports = router;
