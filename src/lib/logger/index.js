'use strict';

const log4js = require('log4js');

const config = require('./../config');

class Logger {

    /**
     * Initialize default settings
     */
    constructor () {
        // Load configurations
        log4js.configure(require('./log4j'));
    }

    /**
     * Get access logger
     */
    getAccessLog () {
        return log4js.connectLogger(config.ENABLE_LOG_FILE === 'true' ? log4js.getLogger('access') : log4js.getLogger());
    }

    /**
     * Get application logger
     */
    getAppLog () {
        return config.ENABLE_LOG_FILE === 'true' ? log4js.getLogger('app') : log4js.getLogger();
    }

    /**
     * Get socket logger
     */
    getSocketLog () {
        return config.ENABLE_LOG_FILE === 'true' ? log4js.getLogger('socket') : log4js.getLogger();
    }

}

module.exports = new Logger();
