goog.provide('anychart.core.StateSettings');
goog.require('anychart.core.Base');
goog.require('anychart.core.settings');
goog.require('anychart.core.settings.IObjectWithSettings');



/**
 * Class representing state settings (normal, hover, selected)
 * @implements {anychart.core.settings.IObjectWithSettings}
 * @constructor
 */
anychart.core.StateSettings = function() {
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
  this.descriptorsMeta = {};
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
  // no capabilities. check always returns true
  return void 0;
};


/** @inheritDoc */
anychart.core.StateSettings.prototype.getConsistencyState = function(fieldName) {
  return this.descriptorsMeta[fieldName].consistency;
};


/** @inheritDoc */
anychart.core.StateSettings.prototype.getSignal = function(fieldName) {
  return this.descriptorsMeta[fieldName].signal;
};


/** @inheritDoc */
anychart.core.StateSettings.prototype.getHookContext = function(fieldName) {
  return this.descriptorsMeta[fieldName].context;
};


/** @inheritDoc */
anychart.core.StateSettings.prototype.getHook = function(fieldName) {
  return this.descriptorsMeta[fieldName].beforeInvalidationHook;
};
//endregion
//region --- Exports
//endregion
