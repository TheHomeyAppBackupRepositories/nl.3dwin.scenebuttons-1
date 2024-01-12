'use strict';

const { Driver } = require('homey');

class SceneButtonDriver extends Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('SceneButtonDriver has been initialized');

    this._recalledFlow = this.homey.flow.getDeviceTriggerCard('recalled');
  }

  /**
   * onPairListDevices is called when a user is adding a device
   * and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices() {
    return [
      {
        name: 'SceneButton',
        data: {
          id: 'scenebutton-'+ Date.now(),
        },
      },
      // Example device data, note that `store` is optional
      // {
      //   name: 'My Device',
      //   data: {
      //     id: 'my-device',
      //   },
      //   store: {
      //     address: '127.0.0.1',
      //   },
      // },
    ];
  }

  triggerRecalledFlow(device) {
    this._recalledFlow.trigger(device)
      .then(this.log)
      .catch(this.error);
    this.log('Recalled flow triggered');
  }
}

module.exports = SceneButtonDriver;
