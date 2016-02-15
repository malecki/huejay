'use strict';

let models = {
    LCT001: require('./LCT001'),
    LCT002: require('./LCT002'),
    LCT003: require('./LCT003'),
    LCT007: require('./LCT007'),

    LLC006: require('./LLC006'),
    LLC007: require('./LLC007'),
    LLC010: require('./LLC010'),
    LLC011: require('./LLC011'),
    LLC012: require('./LLC012'),
    LLC013: require('./LLC013'),
    LLC020: require('./LLC020'),

    LLM001: require('./LLM001'),
    LLM010: require('./LLM010'),
    LLM011: require('./LLM011'),
    LLM012: require('./LLM012'),

    LST001: require('./LST001'),
    LST002: require('./LST002'),

    LWB004: require('./LWB004'),
    LWB006: require('./LWB006'),
    LWB007: require('./LWB007'),

    Unknown: require('./Unknown')
};


/**
 * Factory for Light Models
 */
class Factory {
  /**
   * Create light model
   *
   * @param {string} modelId Model Id
   *
   * @return {AbstractLightModel} LightModel
   */
  static createLightModel(modelId) {
    if (Object.keys(models).indexOf(modelId) === -1) {
      modelId = 'Unknown';
    }

    let LightModel = models[modelId]

    return new LightModel;
  }
}

module.exports = Factory;
