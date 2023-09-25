'use strict';

const status = require('http-status');

class HttpResponse {

    /**
     * Send success result to the client
     */
    success (_res, _data) {
        _res.json({
            status: 1,
            data: _data
        });
    }

    /**
     * Send error result to the client
     */
    error (_res, _code, _msg) {
        _res.json({
            status: 0,
            error: {
                code: _code,
                message: _msg || status[_code]
            }
        });
    }

}

module.exports = new HttpResponse();
