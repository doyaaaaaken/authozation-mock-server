class AuthorizationApiErrorResopnse {
    constructor(error, error_description, state) {
        this.error = error;
        this.error_description = error_description;
        this.state = state;
    }
}

module.exports = AuthorizationApiErrorResopnse;
