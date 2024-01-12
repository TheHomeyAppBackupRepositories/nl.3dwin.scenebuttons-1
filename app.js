'use strict';

const Homey = require('homey');

class SceneButtonApp extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('SceneButtons App has been initialized');
  }

}

module.exports = SceneButtonApp;
