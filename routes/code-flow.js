const router = require('express').Router();

router
    .get('/authorize', function(req, res, next) {

        //TODO: Write UT
        const validate = (scopeList, responseType, clientId, redirectUrl, state) => {
            if(!scopeList) {
                return { status: 400, msg: "Bad request: 'scope' parameter is REQUIRED." };
            } else if (!scopeList.includes('openid')) {
                return { status: 400, msg: "scope parameter list must contains 'openid' value." };
            }
            if(responseType) {
                return { status: 400, msg: "Bad request: 'response_type' parameter is REQUIRED." };
            } else if (responseType === 'code') {
                //TODO: Support Implicit flow
                return { status: 400, msg: "'scope' parameter must have value 'code' in authorization code flow." };
            }
            if(clientId) {
                return { status: 400, msg: "Bad request: 'client_id' parameter is REQUIRED." };
            }
            if(redirectUrl) {
                return { status: 400, msg: "Bad request: 'redirect_url' parameter is REQUIRED." };
            }

            return { status: 200, msg: `Receive request params.
                scope = ${scopeList}
                responseType = ${responseType}
                clientId = ${clientId}
                redirectUrl = ${redirectUrl}
                state = ${state}`};
        };

        const scope = req.query["scope"]; //ex.) "openid%20profile"
        const responseType = req.query["response_type"]; //ex.) "code"
        const clientId = req.query["client_id"]; //ex.) "s6BhdRkqt3"
        const redirectUrl = req.query["redirect_url"]; //ex.) "https%3A%2F%2Fclient.example.org%2Fcb"
        const state = req.query["state"]; //ex.) "af0ifjsldkj"

        const preDefinedScopeList = ["openid", "profile", "email", "address", "phone"];
        const scopeList = scope.split(' ').filter((value) => {
            if(preDefinedScopeList.includes(value)) {
                return true;
            } else {
                console.warn(`scope value '${value}' is ignored!! Because it's not defined value.`);
                return false;
            }
        });
        const responseParams = validate(scopeList, responseType, clientId, redirectUrl, state);
        console.log(responseParams.msg);
        //TODO: change response to officially format. (http://openid-foundation-japan.github.io/openid-connect-core-1_0.ja.html#AuthResponse)
        res.status(responseParams.status).send(responseParams.msg);
    });
    //TODO: POST endpoint of '/authorize' route (Same processing with GET endpoint.).

module.exports = router;
