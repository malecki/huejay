'use strict';

const SUPPORTED_TYPES = [
    'CLIPGenericFlag',
    'CLIPGenericStatus',
    'CLIPHumidity',
    'CLIPOpenClose',
    'CLIPPresence',
    'CLIPSwitch',
    'CLIPTemperature',
    'Daylight',
    'ZGPSwitch',
    'ZLLSwitch',
    'Unknown',
];
let states = {
    'CLIPGenericFlag ': require('./CLIPGenericFlag/State'),
    'CLIPGenericStatus': require('./CLIPGenericStatus/State'),
    'CLIPHumidity': require('./CLIPHumidity/State'),
    'CLIPOpenClose': require('./CLIPOpenClose/State'),
    'CLIPPresence': require('./CLIPPresence/State'),
    'CLIPSwitch': require('./CLIPSwitch/State'),
    'CLIPTemperature': require('./CLIPTemperature/State'),
    'Daylight': require('./Daylight/State'),
    'ZGPSwitch': require('./ZGPSwitch/State'),
    'ZLLSwitch': require('./ZLLSwitch/State'),
    'Unknown': require('./Unknown/State')
}
let configs = {
    'CLIPGenericFlag ': require('./CLIPGenericFlag/Config'),
    'CLIPGenericStatus': require('./CLIPGenericStatus/Config'),
    'CLIPHumidity': require('./CLIPHumidity/Config'),
    'CLIPOpenClose': require('./CLIPOpenClose/Config'),
    'CLIPPresence': require('./CLIPPresence/Config'),
    'CLIPSwitch': require('./CLIPSwitch/Config'),
    'CLIPTemperature': require('./CLIPTemperature/Config'),
    'Daylight': require('./Daylight/Config'),
    'ZGPSwitch': require('./ZGPSwitch/Config'),
    'ZLLSwitch': require('./ZLLSwitch/Config'),
    'Unknown': require('./Unknown/Config')
}

/**
 * Factory for Sensor Types
 */
class Factory {
  /**
   * Create sensor config
   *
   * @param {string} type   Type
   * @param {Object} config Config
   *
   * @return {Object} Sensor config
   */
  static createSensorConfig(type, config) {
    type = this.mapSensorType(type);

    let SensorConfig = configs[type]

    return new SensorConfig(config);
  }

  /**
   * Create sensor state
   *
   * @param {string} type  Type
   * @param {Object} state State
   *
   * @return {Object} Sensor state
   */
  static createSensorState(type, state) {
    type = this.mapSensorType(type);

    let SensorState = states[type]

    return new SensorState(state);
  }

  /**
   * Map sensor type
   *
   * @param {string} type Type
   *
   * @return {string} Type
   */
  static mapSensorType(type) {
    return SUPPORTED_TYPES.indexOf(type) !== -1
      ? type
      : 'Unknown';
  }
}

module.exports = Factory;
