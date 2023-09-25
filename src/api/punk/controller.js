'use strict';

const { PunkData } = require('../../monitor');

class Controller {
  static async getAll(_, res) {
    const punkData = await PunkData.getInstance();

    res.json(punkData.punks);
  }

  static async getById(req, res) {
    const id = req.params.id;
    const punkData = await PunkData.getInstance();

    res.json(punkData.getPunkById(id));
  }

  static async getByAddress(req, res) {
    const address = req.params.address;
    const punkData = await PunkData.getInstance();

    res.json(punkData.getPunksByAddress(address));
  }
}

module.exports = Controller;
