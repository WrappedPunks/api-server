'use strict';

const { PunkData } = require('../../monitor');

class Controller {
  static async getPunksByAddress(req, res) {
    const address = req.params.address.toLowerCase();
    const punkData = await PunkData.getInstance();

    const punks = punkData.getPunksByAddress(address) || [];
    res.json(punks);
  }

  static async getWPunksByAddress(req, res) {
    const address = req.params.address.toLowerCase();
    const punkData = await PunkData.getInstance();
    const wPunks = punkData.getWPunksByAddress(address) || [];

    res.json(wPunks);
  }
}

module.exports = Controller;
