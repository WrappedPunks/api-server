'use strict';

const router = require('express').Router();
const wrap = require('../common').wrapAsync;
const controller = require('./controller');

// Define api
router.get('/is-confirmed/:hash', wrap(controller.getTxReceipt));

module.exports = router;
