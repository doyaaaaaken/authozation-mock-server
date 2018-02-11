const router = require('express').Router();

router
    .get('/', (req, res, next) => {
        res.render('oauth2', { title: 'OAuth2' });
    })
    .get('/callback', (req, res, next) => {
        //TODO: implement
    });

module.exports = router;
