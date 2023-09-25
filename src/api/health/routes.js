'use strict';

const router = require('express').Router();

const controller = require('./controller');
const wrap = require('./../common').wrapAsync;

// Define api
router.get('/', wrap(controller.checkHealth));

module.exports = router;
