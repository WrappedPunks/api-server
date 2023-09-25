'use strict';

const response = require('./../../lib/http-response');

class Controller {

    static async checkHealth (_req, _res) {
        response.success(_res, 'OK');
    }

}

module.exports = Controller;
