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

module.exports = TokenApiSuccessResponse;
