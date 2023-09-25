'use strict';

const router = require('express').Router();

// Define api
router.use('/_health', require('./health/routes'));
router.use('/punks', require('./punks/routes'));
router.use('/punk', require('./punk/routes'));
router.use('/wpunk', require('./wpunk/routes'));
router.use('/owner', require('./owner/routes'));
router.use('/tx', require('./tx/routes'));

module.exports = router;
