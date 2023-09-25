'use strict';

const { default: Decimal } = require('decimal.js');
const { Alchemy, PunkData } = require('../../monitor');

class Controller {
  /**
   * Get metadata of punk
   */
  static async getTxReceipt(req, res) {
    const hash = req.params.hash;
    const dataInstance = await PunkData.getInstance();

    const txReceipt = await Alchemy.getTransactionReceipt(hash);
    if (!txReceipt) {
      return res.json({ status: 'pending' });
    }

    const { status, blockNumber } = txReceipt;
    const blockNumberDec = new Decimal(blockNumber).toNumber();

    if (blockNumberDec > dataInstance.lastBlock) {
      return res.json({ status: 'pending' });
    }

    if (status === '0x0') {
      return res.json({ status: 'failed', blockNumber: blockNumberDec });
    }

    return res.json({ status: 'confirmed', blockNumber: blockNumberDec });
  }
}

module.exports = Controller;
