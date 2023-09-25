'use strict';

const router = require('express').Router();
const wrap = require('../common').wrapAsync;
const controller = require('./controller');

// Define api
router.get('/:address/punk', wrap(controller.getPunksByAddress));
router.get('/:address/wpunk', wrap(controller.getWPunksByAddress));

module.exports = router;
