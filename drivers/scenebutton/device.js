'use strict';

const { Device } = require('homey');
const { HomeyAPI } = require('athom-api');

class SceneButton extends Device {

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {

    this.log('SceneButton '+ this.getName() +' has been initialized', this.getStoreValue('state'));

    this.registerCapabilityListener('button', async (value, opts) => {
      this.restoreValues();
      this.driver.ready().then(() => {
        this.driver.triggerRecalledFlow(this);
      });
    });

    this.registerCapabilityListener('button.store', async (value, opts) => {
      this.saveValues();
    });
  }

  /**
   * Get Homey Api
   * @returns HomeyAPI instance
   */
  async getHomeyAPI() {
    return await HomeyAPI.forCurrentHomey(this.homey);
  }

  async restoreValues() {
    let state = JSON.parse(this.getStoreValue('state'));
    this.log("Received restore request");

    const api = await this.getHomeyAPI();
    for(let d of state) {
      let device = await api.devices.getDevice({ id: d.id });
      
      for(let cap of Object.values(d.capabilities)) {
        device.setCapabilityValue(cap.id, cap.value);

        // api.devices.setCapabilityValue({
        //   deviceId: d.id,
        //   capabilityId: cap.id,
        //   value: cap.value,
        //   opts: {
        //     duration: 10000
        //   }
        // });

        this.log(device.name, cap.id, cap.value);
      }
    }
  }

  async saveValues() {
    let zoneId = (await this.getRealDevice()).zone;
    let devices = await (await this.getHomeyAPI()).devices.getDevices();

    let state = []
    for(const device of Object.values(devices)) {
      if ((device.class != 'light' && device.virtualClass != 'light') || device.driverUri === 'homey:app:com.swttt.devicegroups') {
        continue;
      }

      if(device.zone === zoneId) {
        state.push({
          id: device.id, 
          name: device.name,
          capabilities: device.capabilitiesObj
        });
      }
    };

    this.log("State saved");
    this.setStoreValue('state', JSON.stringify(state));
  }

  async getRealDevice() {
    let devices = await (await this.getHomeyAPI()).devices.getDevices();
    let rtn;
    Object.values(devices).forEach(device => {
      if(device.data.id === this.getData().id) {
        rtn = device;
      }
    });
    return rtn;
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('SceneButton has been added', this.getData().id);
    await this.saveValues();
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log('SceneButton settings where changed');

    if(newSettings.update) {
      this.log('Update request received!');
      this.saveValues();
      setTimeout(() => { this.setSettings({ update: false }) }, 500);
      //return "Update request initiated!";
    }
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name) {
    this.log('SceneButton was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('SceneButton has been deleted');
  }

}

module.exports = SceneButton;
