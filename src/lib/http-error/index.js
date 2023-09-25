'use strict';

class HttpError extends Error {

    constructor (_code, _message) {
        super();
        this.code = _code;
        this.message = _message;
    }

}

module.exports = HttpError;
