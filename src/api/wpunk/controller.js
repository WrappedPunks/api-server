'use strict';

const { PunkData } = require('../../monitor');

class Controller {
  static async getAll(_, res) {
    const punkData = await PunkData.getInstance();

    res.json(punkData.wPunks);
  }

  static async getById(req, res) {
    const id = req.params.id;
    const punkData = await PunkData.getInstance();
    const wPunk = punkData.getWPunkById(id);

    if (!wPunk) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    res.json(punkData.getWPunkById(id));
  }
}

module.exports = Controller;
