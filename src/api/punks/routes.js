'use strict';

const router = require('express').Router();
const wrap = require('../common').wrapAsync;
const controller = require('./controller');

// Define api
router.get('/metadata/:id', wrap(controller.getMetadata));

module.exports = router;
