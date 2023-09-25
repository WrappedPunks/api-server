'use strict';

class Controller {
  /**
   * Get metadata of punk
   */
  static async getMetadata(_req, _res) {
    const id = _req.params.id;

    _res.json({
      title: `W#${id}`,
      name: `W#${id}`,
      description: 'This Punk was wrapped using Wrapped Punks contract, accessible from https://wrappedpunks.com',
      image: `${process.env.IMAGES_DOMAIN}/images/punks/${id}.png`,
      external_url: 'https://wrappedpunks.com'
    });
  }
}

module.exports = Controller;
