goog.provide('anychart.core.StateSettings');
goog.require('anychart.core.Base');



/**
 * Class representing state settings (normal, hover, selected)
 * @constructor
 */
anychart.core.StateSettings = function() {
  anychart.core.StateSettings.base(this, 'constructor');
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
//region --- IObjectWithSettings implementation
//endregion
//region --- Exports
//endregion
