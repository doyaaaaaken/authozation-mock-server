# OAuth 2.0 and OpenID Connect 1.0 Mock Server

This is mock server application with endpoints of [OAuth2.0](https://tools.ietf.org/html/rfc6749) and [OpenID Connect 1.0](http://openid.net/connect/).
It has not only authorization server endpoints, but also has client application callback endpoints with same application.

Authorization server endpoints are implemented on `/auth-server/oauth2/*` and `/auth-server/openid-connect/*` endpoints.
Client application endpoints are implemented on `/client-app/oauth2/*` and `/client-app/openid-connect/*` endpoints.

See details on `Endpoints` section.

# Usage

| Purpose         | command     |
|-----------------|-------------|
| run application | `npm start` |
| run application with debugging | `npm run debug` |
| test application | `npm test` |

# Endpoints

See API Documentation. Document exists below folder.

* API Blueprint Format: `./doc/api.md`
* HTML Format: `./doc/output/api.html`

