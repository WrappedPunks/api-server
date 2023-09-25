'use strict';

const joi = require('joi');
const HttpError = require('./../lib/http-error');

class Common {

    /**
   * Validate all parameters that is sent by GET or POST,
   * then return the values
   */
    validateInputParams (_params, _schema) {
        const { error, value } = joi.validate(_params, _schema);

        if (error) {
            throw new HttpError(400, error.details[0].message);
        }

        return value;
    }

    /**
   * Wrap the controller handler that contains async/await
   */
    wrapAsync (_fn) {
        return (req, res, next) => {
            Promise.resolve(_fn(req, res, next)).catch(next);
        };
    }

}

module.exports = new Common();
