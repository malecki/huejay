'use strict';

let SUPPORTED_SENSORS = {
    'PHDL00': require('./PHDL00'),
    'RWL020': require('./RWL020'),
    'RWL021': require('./RWL021'),
    'ZGPSWITCH': require('./ZGPSWITCH'),
    'Unknown': require('./Unknown')
}

/**
 * Factory for Sensor Models
 */
class Factory {
  /**
   * Create sensor model
   *
   * @param {string} modelId Model Id
   *
   * @return {AbstractSensorModel} Sensor model
   */
  static createSensorModel(modelId) {
    if (Object.keys(SUPPORTED_SENSORS).indexOf(modelId) === -1) {
      modelId = 'Unknown';
    }

    let SensorModel = SUPPORTED_SENSORS(modelId);

    return new SensorModel;
  }
}

module.exports = Factory;
