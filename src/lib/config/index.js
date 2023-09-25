'use strict';

require('dotenv').config();

const config = {};

// Environment variables
const envs = [
    'PORT',
    'IMAGES_DOMAIN',
    'ENABLE_LOG_FILE',
    'ENV',
    'REDIRECT_DOMAIN'
];

// Check environment variables to ensure that all of them are declared
envs.forEach((env) => {
    if (process.env[env] === undefined) {
        console.log(`Environment variable \x1b[33m"${env}"\x1b[0m is required in file \x1b[33m".env"\x1b[0m \n`);
        process.exit(0);
    }

    config[env] = process.env[env];
});

module.exports = config;
