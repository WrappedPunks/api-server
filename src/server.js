'use strict';

const fs = require('fs');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const http = require('http').createServer(app);

const logger = require('./lib/logger');
const routes = require('./api/routes');
const config = require('./lib/config');
const response = require('./lib/http-response');
const { Monitor } = require('./monitor');

const log = logger.getAppLog();

class Server {

    constructor () {
        app.use(cors());
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));

        // Log all requests
        app.use(logger.getAccessLog());

        // Define api routes
        app.use('/api', routes);
        app.use('/', (req, res) => {
            res.redirect(`${config.REDIRECT_DOMAIN}${req.url}`);
        });
        // Define the error handler
        app.use(this._handleError);
    }

    _handleError (_err, _req, _res, _next) {
        try {
            // Delete uploaded image in the error case
            if (_req.body.image && fs.existsSync(_req.body.image.path)) {
                fs.unlinkSync(_req.body.image.path);
            }

            // Delete uploaded background in the error case
            if (_req.body.background && fs.existsSync(_req.body.background.path)) {
                fs.unlinkSync(_req.body.background.path);
            }

        } catch (e) {
            log.error(e.stack);
        }

        // Send error to the client
        response.error(_res, _err.code, _err.message);
    }

    async start () {
        log.info('Listening on port', config.PORT);

        await Monitor.getInstance();

        // Start server
        await http.listen(config.PORT);
    }

}

module.exports = new Server();
