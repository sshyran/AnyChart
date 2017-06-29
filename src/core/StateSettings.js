goog.provide('anychart.core.StateSettings');
goog.require('anychart.core.Base');
goog.require('anychart.core.settings');
goog.require('anychart.core.settings.IObjectWithSettings');



/**
 * Class representing state settings (normal, hover, selected)
 * @param {!Object.<string, anychart.core.settings.PropertyDescriptorMeta>} descriptorsMeta Descriptors for state.
 * @implements {anychart.core.settings.IObjectWithSettings}
 * @constructor
 */
anychart.core.StateSettings = function(descriptorsMeta) {
  anychart.core.StateSettings.base(this, 'constructor');

  /**
   * Own settings.
   * @type {Object}
   */
  this.ownSettings = {};

  /**
   * Theme settings.
   * @type {Object}
   */
  this.themeSettings = {};

  /**
   * @type {!Object.<string, anychart.core.settings.PropertyDescriptorMeta>}
   */
  this.descriptorsMeta = descriptorsMeta;
  var a = [
    'fill',
    'negativeFill',
    'risingFill',
    'fallingFill',
    'stroke',
    'lowStroke',
    'highStroke',
    'negativeStroke',
    'risingStroke',
    'fallingStroke',
    'medianStroke',
    'stemStroke',
    'whiskerStroke',
    'hatchFill',
    'negativeHatchFill',
    'risingHatchFill',
    'fallingHatchFill',
    'whiskerWidth',
    'type',
    'size',

    'hoverFill',
    'hoverNegativeFill',
    'hoverRisingFill',
    'hoverFallingFill',
    'hoverStroke',
    'hoverLowStroke',
    'hoverHighStroke',
    'hoverNegativeStroke',
    'hoverRisingStroke',
    'hoverFallingStroke',
    'hoverMedianStroke',
    'hoverStemStroke',
    'hoverWhiskerStroke',
    'hoverHatchFill',
    'hoverNegativeHatchFill',
    'hoverRisingHatchFill',
    'hoverFallingHatchFill',
    'hoverWhiskerWidth',
    'hoverType',
    'hoverSize',

    'selectFill',
    'selectNegativeFill',
    'selectRisingFill',
    'selectFallingFill',
    'selectStroke',
    'selectLowStroke',
    'selectHighStroke',
    'selectNegativeStroke',
    'selectRisingStroke',
    'selectFallingStroke',
    'selectMedianStroke',
    'selectStemStroke',
    'selectWhiskerStroke',
    'selectHatchFill',
    'selectNegativeHatchFill',
    'selectRisingHatchFill',
    'selectFallingHatchFill',
    'selectWhiskerWidth',
    'selectType',
    'selectSize'
  ];
};
goog.inherits(anychart.core.StateSettings, anychart.core.Base);


/**
 * .
 */
anychart.core.StateSettings.prototype.dummy = function() {};


//region --- Setup / Serialize / Dispose
/** @inheritDoc */
anychart.core.StateSettings.prototype.disposeInternal = function() {
  anychart.core.StateSettings.base(this, 'disposeInternal');
};


//endregion
//region --- Descriptors
/**
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.StateSettings.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  /**
   * @type {!Object.<string, Array>}
   */
  var descriptors = anychart.core.settings.descriptors;

  anychart.core.settings.createDescriptor(map, descriptors.FILL);

  return map;
})();
anychart.core.settings.populate(anychart.core.StateSettings, anychart.core.StateSettings.PROPERTY_DESCRIPTORS);


//endregion
//region --- Complex objects
/**
 * Labels.
 * @param {Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.core.ui.LabelsFactory}
 */
anychart.core.StateSettings.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsFactory();
    this.labels_.listenSignals(this.labelsInvalidated_, this);
    this.labels_.setParentEventTarget(this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.labels_.setup(opt_value);
    return this;
  }
  return this.labels_;
};


/**
 * Labels invalidation handler.
 * @param {anychart.SignalEvent} event Signal event.
 * @private
 */
anychart.core.StateSettings.prototype.labelsInvalidated_ = function(event) {
  var meta = this.descriptorsMeta['labels'];
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    if (meta.beforeInvalidationHook) {
      meta.beforeInvalidationHook.call(meta.context || this);
    }
    this.invalidate(meta.consistency, meta.signal);
  }
};


//endregion
//region --- IObjectWithSettings implementation
/** @inheritDoc */
anychart.core.StateSettings.prototype.getOwnOption = function(name) {
  return this.ownSettings[name];
};


/** @inheritDoc */
anychart.core.StateSettings.prototype.hasOwnOption = function(name) {
  return goog.isDef(this.ownSettings[name]);
};


/** @inheritDoc */
anychart.core.StateSettings.prototype.getThemeOption = function(name) {
  return this.themeSettings[name];
};


/** @inheritDoc */
anychart.core.StateSettings.prototype.getOption = function(name) {
  return goog.isDef(this.ownSettings[name]) ? this.ownSettings[name] : this.themeSettings[name];
};


/** @inheritDoc */
anychart.core.StateSettings.prototype.setOption = function(name, value) {
  this.ownSettings[name] = value;
};


/** @inheritDoc */
anychart.core.StateSettings.prototype.check = function(flags) {
  return true;
};


/** @inheritDoc */
anychart.core.StateSettings.prototype.getCapabilities = function(fieldName) {
  if (fieldName in this.descriptorsMeta)
    return this.descriptorsMeta[fieldName].capabilities;
  else
    return 0;
};


/** @inheritDoc */
anychart.core.StateSettings.prototype.getConsistencyState = function(fieldName) {
  if (fieldName in this.descriptorsMeta)
    return this.descriptorsMeta[fieldName].consistency;
  else
    return 0;
};


/** @inheritDoc */
anychart.core.StateSettings.prototype.getSignal = function(fieldName) {
  if (fieldName in this.descriptorsMeta)
    return this.descriptorsMeta[fieldName].signal;
  else
    return 0;
};


/** @inheritDoc */
anychart.core.StateSettings.prototype.getHookContext = function(fieldName) {
  if (fieldName in this.descriptorsMeta)
    return this.descriptorsMeta[fieldName].context;
  else
    return null;
};


/** @inheritDoc */
anychart.core.StateSettings.prototype.getHook = function(fieldName) {
  if (fieldName in this.descriptorsMeta)
    return this.descriptorsMeta[fieldName].beforeInvalidationHook || goog.nullFunction;
  else
    return goog.nullFunction;
};
//endregion
//region --- Exports
//endregion
