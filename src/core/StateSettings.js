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
};
goog.inherits(anychart.core.StateSettings, anychart.core.Base);


/**
 * .
 */
anychart.core.StateSettings.prototype.dummy = function() {};


//region --- setup/serialize/dispose
/** @inheritDoc */
anychart.core.StateSettings.prototype.disposeInternal = function() {
  anychart.core.StateSettings.base(this, 'disposeInternal');
};


//endregion
//region --- Descriptors

//endregion
//region --- Complex objects
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
//endregion
//region --- Exports
//endregion
