'use strict';

module.exports = {
    appenders: {
        console: {
            type: 'console',
            layout: {
                type: 'pattern',
                pattern: '%[[%d{yyyy/MM/dd hh:mm:ss.SSS}] %-5p%] - %m'
            }
        },
        access: {
            type: 'dateFile',
            filename: 'logs/access.log',
            pattern: '-yyyy-MM-dd',
            layout: {
                type: 'pattern',
                pattern: '[%d{yyyy/MM/dd hh:mm:ss.SSS}] %-5p - %m'
            }
        },
        app: {
            type: 'dateFile',
            filename: 'logs/app.log',
            pattern: '-yyyy-MM-dd',
            layout: {
                type: 'pattern',
                pattern: '[%d{yyyy/MM/dd hh:mm:ss.SSS}] %-5p - %m'
            }
        },
        socket: {
            type: 'dateFile',
            filename: 'logs/socket.log',
            pattern: '-yyyy-MM-dd',
            layout: {
                type: 'pattern',
                pattern: '[%d{yyyy/MM/dd hh:mm:ss.SSS}] %-5p - %m'
            }
        }
    },
    categories: {
        default: {
            appenders: [
                'console'
            ],
            level: 'all'
        },
        app: {
            appenders: [
                'console',
                'app'
            ],
            level: 'all'
        },
        access: {
            appenders: [
                'console',
                'access'
            ],
            level: 'all'
        },
        socket: {
            appenders: [
                'console',
                'socket'
            ],
            level: 'all'
        }
    }
};
