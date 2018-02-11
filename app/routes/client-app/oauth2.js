const router = require('express').Router();
const request = require('request');
const url = require('url');

router
    .get('/', (req, res, next) => {
        res.render('oauth2', {title: 'OAuth2 Sample'});
    })
    //This callback endpoint is called by Authorization Code Flow.
    .get('/callback/authorization-code-flow', (req, res, next) => {
        const code = req.query["code"];
        const state = req.query["state"];

        const options = {
            uri: 'http://localhost:3000/auth-server/oauth2/token',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            form: {
                "grant_type": "authorization_code",
                "code": (code) ? code : null,
                "redirect_uri": "http://localhost:3000/client-app/oauth2/callback/authorization-code-flow",
                "client_id": "cid-xxx-12345"
            }
        };
        request.post(options, (error, response, body) => {
            if (error) {
                res.render('oauth2-result', {result: 'ERROR'});
            } else {
                if (response.statusCode !== 200) {
                    res.render('oauth2-result', {result: 'Failed', description: JSON.stringify(response.body)});
                } else {
                    res.render('oauth2-result', {result: 'Success', description: JSON.stringify(response.body)});
                }
            }
        });
    })
    //This callback endpoint is called by Implicit Flow.
    .get('/callback/implicit-flow', (req, res, next) => {
        res.render('oauth2-result', {result: '', description: ''});
    });

module.exports = router;
