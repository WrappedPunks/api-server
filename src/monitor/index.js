const tsNode = require('ts-node');
const json = require('json5');
const fs = require('fs-extra');
const path = require('path');

const tsconfig = {
  compilerOptions: {
    /** read existing tsconfig
     * json5.parses json with comments to proper json
    */
    ...json.parse(fs.readFileSync(path.join(__dirname, '../../tsconfig.json'))).compilerOptions
  },
  transpileOnly: true
};

tsNode.register(tsconfig);

const { Data } = require('./data');
const { Monitor } = require('./monitor');
const Alchemy = require('./alchemy');

module.exports = {
  PunkData: Data,
  Monitor,
  Alchemy
};
