const url = require('url');

class AuthorizationApiErrorResopnse {
    constructor(error, error_description, state) {
        this.error = error;
        this.error_description = error_description;
        this.state = state;
    }

    toUriWithQureyParam(redirectTargetUri) {
        const errorDescription = this.error_description ? this.error_description : '';
        const state = (this.state) ? this.state : '';
        return url.parse(`${redirectTargetUri}?error=${this.error}&error_description=${errorDescription}&state=${state}`).href;
    }

    toUriWithFragment(redirectTargetUri) {
        const errorDescription = this.error_description ? this.error_description : '';
        const state = (this.state) ? this.state : '';
        return url.parse(`${redirectTargetUri}#error=${this.error}&error_description=${errorDescription}&state=${state}`).href;
    }
}

module.exports = AuthorizationApiErrorResopnse;
