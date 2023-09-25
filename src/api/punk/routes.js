'use strict';

const router = require('express').Router();
const wrap = require('../common').wrapAsync;
const controller = require('./controller');

// Define api
router.get('/', wrap(controller.getAll));
router.get('/:id', wrap(controller.getById));

module.exports = router;
