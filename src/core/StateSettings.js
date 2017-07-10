goog.provide('anychart.core.StateSettings');
goog.require('anychart.core.Base');
goog.require('anychart.core.settings');
goog.require('anychart.core.settings.IObjectWithSettings');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.MarkersFactory');



/**
 * Class representing state settings (normal, hovered, selected)
 * @param {anychart.core.settings.IObjectWithSettings} stateHolder State holder.
 * @param {!Object.<string, anychart.core.settings.PropertyDescriptorMeta>} descriptorsMeta Descriptors for state.
 * @param {anychart.PointState} stateType
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.core.StateSettings = function(stateHolder, descriptorsMeta, stateType) {
  anychart.core.StateSettings.base(this, 'constructor');

  /**
   * @type {anychart.core.settings.IObjectWithSettings}
   */
  this.stateHolder = stateHolder;

  /**
   * @type {!Object.<string, anychart.core.settings.PropertyDescriptorMeta>}
   */
  this.descriptorsMeta = descriptorsMeta;

  /**
   * @type {anychart.PointState}
   */
  this.stateType = stateType;
};
goog.inherits(anychart.core.StateSettings, anychart.core.Base);


/** @inheritDoc */
anychart.core.StateSettings.prototype.invalidate = function(state, opt_signal) {
  return this.stateHolder.invalidate(state, opt_signal);
};


//region --- Setup / Serialize / Dispose
/** @inheritDoc */
anychart.core.StateSettings.prototype.disposeInternal = function() {
  goog.disposeAll(this.labels_, this.markers_);
  anychart.core.StateSettings.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.core.StateSettings.prototype.serialize = function() {
  var json = anychart.core.StateSettings.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.core.StateSettings.PROPERTY_DESCRIPTORS, json, 'State settings', this.descriptorsMeta);
  json['labels'] = this.labels().serialize();
  json['markers'] = this.markers().serialize();
  return json;
};


/** @inheritDoc */
anychart.core.StateSettings.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.StateSettings.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.core.StateSettings.PROPERTY_DESCRIPTORS, config);
  this.labels().setupInternal(!!opt_default, config['labels']);
  this.markers().setupInternal(!!opt_default, config['markers']);
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
  anychart.core.settings.createDescriptors(map, [
    // standart coloring + series coloring
    descriptors.FILL_FUNCTION,
    descriptors.NEGATIVE_FILL,
    descriptors.RISING_FILL,
    descriptors.FALLING_FILL,
    descriptors.STROKE_FUNCTION,
    descriptors.LOW_STROKE,
    descriptors.HIGH_STROKE,
    descriptors.NEGATIVE_STROKE,
    descriptors.RISING_STROKE,
    descriptors.FALLING_STROKE,
    descriptors.MEDIAN_STROKE,
    descriptors.STEM_STROKE,
    descriptors.WHISKER_STROKE,
    descriptors.HATCH_FILL_FUNCTION,
    descriptors.NEGATIVE_HATCH_FILL,
    descriptors.RISING_HATCH_FILL,
    descriptors.FALLING_HATCH_FILL,
    descriptors.WHISKER_WIDTH,
    // marker series
    descriptors.TYPE,
    // marker series + annotations
    descriptors.SIZE,
    // annotations
    descriptors.TREND,
    descriptors.GRID,
    // linear gauge tank pointer
    map.EMPTY_FILL,
    map.EMPTY_HATCH_FILL
  ]);

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
    if (this.stateType == anychart.PointState.NORMAL) {
      var hook = this.descriptorsMeta['labels'].beforeInvalidationHook;
      this.labels_.listenSignals(hook, this.stateHolder);
      this.labels_.setParentEventTarget(this.stateHolder);
    }
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
 * Markers.
 * @param {Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.core.ui.MarkersFactory}
 */
anychart.core.StateSettings.prototype.markers = function(opt_value) {
  if (!this.markers_) {
    this.markers_ = new anychart.core.ui.MarkersFactory();
    if (this.stateType == anychart.PointState.NORMAL) {
      var hook = this.descriptorsMeta['markers'].beforeInvalidationHook;
      this.markers_.listenSignals(hook, this.stateHolder);
      this.markers_.setParentEventTarget(this.stateHolder);
    }
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.markers_.setup(opt_value);
    return this;
  }
  return this.markers_;
};


//endregion
//region --- Exports
(function() {
  var proto = anychart.core.StateSettings.prototype;
  proto['labels'] = proto.labels;
  proto['markers'] = proto.markers;
})();
//endregion
