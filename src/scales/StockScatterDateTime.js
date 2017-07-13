goog.provide('anychart.scales.StockScatterDateTime');
goog.require('anychart.core.Base');
goog.require('anychart.core.stock.IKeyIndexTransformer');
goog.require('anychart.enums');
goog.require('anychart.scales.IXScale');
goog.require('anychart.scales.StockScatterTicksIterator');
goog.require('anychart.utils');
goog.require('goog.array');
goog.require('goog.math');



/**
 * Stock scatter datetime scale class.
 * @param {!anychart.core.stock.IKeyIndexTransformer} chartOrScroller
 * @constructor
 * @extends {anychart.core.Base}
 * @implements {anychart.scales.IXScale}
 */
anychart.scales.StockScatterDateTime = function(chartOrScroller) {
  anychart.scales.StockScatterDateTime.base(this, 'constructor');
  /**
   * Threshold ticks count.
   * @type {number}
   * @private
   */
  this.maxTicksCount_ = 1000;

  /**
   * Minor ticks count.
   * @type {number}
   * @private
   */
  this.ticksCount_ = 6;

  /**
   * Chart reference. Used for key<->index transformations.
   * @type {!anychart.core.stock.IKeyIndexTransformer}
   * @protected
   */
  this.keyIndexTransformer = chartOrScroller;

  /**
   * Auto calculated full scale minimum key.
   * @type {number}
   * @protected
   */
  this.alignedFullMinKey = NaN;

  /**
   * Auto calculated full scale maximum key.
   * @type {number}
   * @protected
   */
  this.alignedFullMaxKey = NaN;

  /**
   * Auto calculated full data minimum key.
   * @type {number}
   * @protected
   */
  this.dataFullMinKey = NaN;

  /**
   * Auto calculated full data maximum key.
   * @type {number}
   * @protected
   */
  this.dataFullMaxKey = NaN;

  /**
   * Current scale minimum key.
   * @type {number}
   * @protected
   */
  this.minKey = NaN;

  /**
   * Current scale maximum key.
   * @type {number}
   * @protected
   */
  this.maxKey = NaN;

  /**
   * Current scale minimum index.
   * @type {number}
   * @protected
   */
  this.minIndex = NaN;

  /**
   * Current scale maximum index.
   * @type {number}
   * @protected
   */
  this.maxIndex = NaN;

  /**
   * Consistency flag. Easier to use than Base consistency here.
   * @type {boolean}
   */
  this.consistent = false;

  /**
   * Major ticks for the scale.
   * @type {anychart.scales.StockScatterTicksIterator}
   * @protected
   */
  this.ticksIterator = null;

  /**
   * Ticks settings.
   * @type {anychart.scales.StockScatterDateTime.TicksSettingsRep}
   * @private
   */
  this.ranges_ = [];
  this.ticks(anychart.scales.StockScatterDateTime.DEFAULT_TICKS_);
};
goog.inherits(anychart.scales.StockScatterDateTime, anychart.core.Base);


/**
 * @typedef {Array<{minor:(string|{unit:anychart.enums.Interval,count:number}),major:(string|{unit:anychart.enums.Interval,count:number})}>}
 */
anychart.scales.StockScatterDateTime.TicksSettings;


/**
 * @typedef {Array<{range:number,minorUnit:anychart.enums.Interval,minorCount:number,majorUnit:anychart.enums.Interval,majorCount:number}>}
 */
anychart.scales.StockScatterDateTime.TicksSettingsRep;


/**
 * Supported signals set.
 * @type {number}
 */
anychart.scales.StockScatterDateTime.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEED_UPDATE_TICK_DEPENDENT |
    anychart.Signal.NEED_UPDATE_FULL_RANGE_ITEMS;


/**
 * Max ticks count for interval-mode ticks calculation.
 * @param {number=} opt_value
 * @return {number|anychart.scales.StockScatterDateTime}
 */
anychart.scales.StockScatterDateTime.prototype.maxTicksCount = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.normalizeToNaturalNumber(opt_value, 1000, false);
    if (this.maxTicksCount_ != val) {
      this.maxTicksCount_ = val;
      this.consistent = false;
      this.dispatchSignal(anychart.Signal.NEED_UPDATE_TICK_DEPENDENT);
    }
    return this;
  }
  return this.maxTicksCount_;
};


/**
 * Desired minor ticks count.
 * @param {number=} opt_value
 * @return {number|anychart.scales.StockScatterDateTime}
 */
anychart.scales.StockScatterDateTime.prototype.ticksCount = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.normalizeToNaturalNumber(opt_value, this.ticksCount_, false);
    if (this.ticksCount_ != val) {
      this.ticksCount_ = val;
      this.consistent = false;
      this.dispatchSignal(anychart.Signal.NEED_UPDATE_TICK_DEPENDENT);
    }
    return this;
  }
  return this.ticksCount_;
};


/**
 * Full scale minimum getter.
 * @return {number|anychart.scales.StockScatterDateTime}
 */
anychart.scales.StockScatterDateTime.prototype.getFullMinimum = function() {
  return this.alignedFullMinKey;
};


/**
 * Full scale maximum getter.
 * @return {number}
 */
anychart.scales.StockScatterDateTime.prototype.getFullMaximum = function() {
  return this.alignedFullMaxKey;
};


/**
 * Current scale minimum getter.
 * @return {number}
 */
anychart.scales.StockScatterDateTime.prototype.getMinimum = function() {
  return this.minKey;
};


/**
 * Current scale maximum getter.
 * @return {number}
 */
anychart.scales.StockScatterDateTime.prototype.getMaximum = function() {
  return this.maxKey;
};


/**
 * Current scale minimum getter.
 * @return {number}
 */
anychart.scales.StockScatterDateTime.prototype.getMinimumIndex = function() {
  return this.minIndex;
};


/**
 * Current scale maximum getter.
 * @return {number}
 */
anychart.scales.StockScatterDateTime.prototype.getMaximumIndex = function() {
  return this.maxIndex;
};


/**
 * Gets current major interval unit.
 * @return {anychart.enums.Interval}
 */
anychart.scales.StockScatterDateTime.prototype.getMajorIntervalUnit = function() {
  return this.majorUnit_;
};


/**
 * Gets current major interval unit count.
 * @return {number}
 */
anychart.scales.StockScatterDateTime.prototype.getMajorIntervalUnitCount = function() {
  return this.majorUnitCount_;
};


/**
 * Gets current minor interval unit.
 * @return {anychart.enums.Interval}
 */
anychart.scales.StockScatterDateTime.prototype.getMinorIntervalUnit = function() {
  return this.minorUnit_;
};


/**
 * Gets current minor interval unit count.
 * @return {number}
 */
anychart.scales.StockScatterDateTime.prototype.getMinorIntervalUnitCount = function() {
  return this.minorUnitCount_;
};


/**
 * Checks if passed value will be treated as missing by this scale.
 * @param {*} value
 * @return {boolean}
 */
anychart.scales.StockScatterDateTime.prototype.isMissing = function(value) {
  return isNaN(anychart.utils.normalizeTimestamp(value));
};


/**
 * Transforms values to ratio.
 * @param {*} value
 * @param {number=} opt_subrangeRatio
 * @return {number}
 */
anychart.scales.StockScatterDateTime.prototype.transform = function(value, opt_subrangeRatio) {
  return this.transformInternal(value, NaN);
};


/**
 * Processes reverse transformation of the ratio backward to value.
 * @param {number} ratio
 * @return {number} Returns timestamp.
 */
anychart.scales.StockScatterDateTime.prototype.inverseTransform = function(ratio) {
  return Math.round(ratio * (this.maxKey - this.minKey) + this.minKey);
};


/** @inheritDoc */
anychart.scales.StockScatterDateTime.prototype.checkWeights = function() {
  return false;
};


/**
 * Returns ticks iterator.
 * @return {anychart.scales.StockScatterTicksIterator}
 */
anychart.scales.StockScatterDateTime.prototype.getTicks = function() {
  this.calculate();
  return this.ticksIterator;
};


/**
 * Aligns passed date by the chart points mesh.
 * @param {number} key
 * @return {number}
 */
anychart.scales.StockScatterDateTime.prototype.alignByIndex = function(key) {
  return this.keyIndexTransformer.getKeyByIndex(Math.ceil(this.keyIndexTransformer.getIndexByKey(key)));
};


/**
 * Calculates ticks. Internal
 */
anychart.scales.StockScatterDateTime.prototype.calculate = function() {
  if (this.consistent) return;

  this.ensureTicksIteratorCreated();

  var dataMinKey, dataMaxKey;
  if (this.maxKey <= this.dataFullMinKey || this.minKey >= this.dataFullMaxKey) {
    dataMinKey = this.minKey;
    dataMaxKey = this.maxKey;
  } else {
    dataMinKey = goog.math.clamp(this.minKey, this.dataFullMinKey, this.dataFullMaxKey);
    dataMaxKey = goog.math.clamp(this.maxKey, this.dataFullMinKey, this.dataFullMaxKey);
  }

  var minorTickRange = Math.abs(dataMaxKey - dataMinKey) / this.ticksCount_;
  if (isNaN(minorTickRange)) {
    this.ticksIterator.setup(
        NaN,
        NaN,
        anychart.utils.getIntervalFromInfo(anychart.enums.Interval.YEAR, 1),
        anychart.utils.getIntervalFromInfo(anychart.enums.Interval.YEAR, 1),
        NaN);
  }

  var len = this.ranges_.length;
  var row;
  for (var i = 0; i < len; i++) {
    if (minorTickRange <= this.ranges_[i].range) {
      row = this.ranges_[i];
      break;
    }
  }
  // Math.ceil(range / (365 * 24 * 60 * 60 * 1000)) is always >= 0.5, because the last
  // this.RANGES is 2 years, so there shouldn't be a situation when interval is 0.
  if (!row) {
    var count = Math.ceil(minorTickRange / (365 * 24 * 60 * 60 * 1000));
    row = {
      range: anychart.utils.getIntervalRange(anychart.enums.Interval.YEAR, count / 2),
      minorUnit: anychart.enums.Interval.YEAR,
      minorCount: count / 2,
      majorUnit: anychart.enums.Interval.YEAR,
      majorCount: count
    };
  }

  this.ticksIterator.setup(
      dataMinKey,
      dataMaxKey,
      anychart.utils.getIntervalFromInfo(row.majorUnit, row.majorCount),
      anychart.utils.getIntervalFromInfo(row.minorUnit, row.minorCount),
      this.dataFullMinKey);

  this.majorUnit_ = row.majorUnit;
  this.majorUnitCount_ = row.majorCount;
  this.minorUnit_ = row.minorUnit;
  this.minorUnitCount_ = row.minorCount;

  this.consistent = true;
};


/**
 * Ensures that the ticks iterator is created.
 */
anychart.scales.StockScatterDateTime.prototype.ensureTicksIteratorCreated = function() {
  if (!this.ticksIterator)
    this.ticksIterator = new anychart.scales.StockScatterTicksIterator();
};


/**
 * Transforms values to ratio.
 * @param {*} key Key of the point to transform.
 * @param {number} index Point index. If it is needed but not passed it would be retrieved automatically.
 * @param {number=} opt_subRangeRatio Subrange ratio. Doesn't mean anything for stock for now.
 * @return {number}
 */
anychart.scales.StockScatterDateTime.prototype.transformInternal = function(key, index, opt_subRangeRatio) {
  return (anychart.utils.normalizeTimestamp(key) - this.minKey) / (this.maxKey - this.minKey);
};


/**
 * Transforms the key for axes, grids, etc.
 * @param {number} key
 * @return {number}
 */
anychart.scales.StockScatterDateTime.prototype.transformAligned = function(key) {
  return this.transform(key);
};


/**
 * Sets full range.
 * @param {number} alignedMinKey
 * @param {number} alignedMaxKey
 * @param {number} dataMinKey
 * @param {number} dataMaxKey
 */
anychart.scales.StockScatterDateTime.prototype.setAutoFullRange = function(alignedMinKey, alignedMaxKey, dataMinKey, dataMaxKey) {
  this.alignedFullMinKey = alignedMinKey;
  this.alignedFullMaxKey = alignedMaxKey;
  this.dataFullMinKey = dataMinKey;
  this.dataFullMaxKey = dataMaxKey;
  this.dispatchSignal(anychart.Signal.NEED_UPDATE_FULL_RANGE_ITEMS);
};


/**
 * Sets current range.
 * @param {number} startKey
 * @param {number} endKey
 * @param {anychart.enums.Interval} unit
 * @param {number} count
 */
anychart.scales.StockScatterDateTime.prototype.setCurrentRange = function(startKey, endKey, unit, count) {
  startKey = goog.math.clamp(startKey, this.alignedFullMinKey, this.alignedFullMaxKey);
  endKey = goog.math.clamp(endKey, this.alignedFullMinKey, this.alignedFullMaxKey);
  var startIndex = this.keyIndexTransformer.getIndexByKey(startKey);
  var endIndex = this.keyIndexTransformer.getIndexByKey(endKey);
  if (isNaN(startIndex) || isNaN(endIndex)) {
    this.minKey = NaN;
    this.maxKey = NaN;
  } else {
    this.minKey = startKey;
    this.maxKey = endKey;
  }
  this.minIndex = startIndex;
  this.maxIndex = endIndex;
  this.unit = unit;
  this.count = count;
  this.consistent = false;
  this.dispatchSignal(anychart.Signal.NEED_UPDATE_TICK_DEPENDENT);
};


/**
 * Ticks invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.scales.StockScatterDateTime.prototype.ticksInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.consistent = false;
    this.dispatchSignal(anychart.Signal.NEED_UPDATE_TICK_DEPENDENT);
  }
};


/**
 *
 * @param {anychart.scales.StockScatterDateTime.TicksSettings} opt_value
 * @return {anychart.scales.StockScatterDateTime.TicksSettings|anychart.scales.StockScatterDateTime}
 */
anychart.scales.StockScatterDateTime.prototype.ticks = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var value = this.normalizeTicks_(opt_value);
    var len = value.length;
    var same = len == this.ranges_.length;
    for (var i = 0; same && i < len; i++) {
      var rangeA = value[i];
      var rangeB = this.ranges_[i];
      same = (
          rangeA.range == rangeB.range &&
          rangeA.minorUnit == rangeB.minorUnit &&
          rangeA.minorCount == rangeB.minorCount &&
          rangeA.majorUnit == rangeB.majorUnit &&
          rangeA.majorCount == rangeB.majorCount);
    }
    if (!same) {
      this.ranges_ = value;
      this.dispatchSignal(anychart.Signal.NEED_UPDATE_TICK_DEPENDENT);
    }
    return this;
  }
  return /** @type {anychart.scales.StockScatterDateTime.TicksSettings} */(
      goog.array.map(this.ranges_, function(item) {
        return {
          'minor': {
            'unit': item.minorUnit,
            'count': item.minorCount
          },
          'major': {
            'unit': item.majorUnit,
            'count': item.majorCount
          }
        };
      }));
};


/**
 * Normalizes anychart.scales.StockScatterDateTime.TicksSettings-like representation to anychart.scales.StockScatterDateTime.TicksSettingsRep.
 * @param {*} value
 * @return {anychart.scales.StockScatterDateTime.TicksSettingsRep}
 * @private
 */
anychart.scales.StockScatterDateTime.prototype.normalizeTicks_ = function(value) {
  var res = [];
  if (goog.isArray(value)) {
    for (var i = 0; i < value.length; i++) {
      var val = value[i];
      if (goog.isObject(val)) {
        var minor = this.normalizeTicksRow_(val['minor']);
        var major = this.normalizeTicksRow_(val['major']);
        if (minor && major) {
          res.push({
            range: anychart.utils.getIntervalRange(minor[0], minor[1]),
            minorUnit: minor[0],
            minorCount: minor[1],
            majorUnit: major[0],
            majorCount: major[1]
          });
        }
      }
    }
    res.sort(function(a, b) { return a.range - b.range; });
  }
  return res;
};


/**
 * Normalizes particular ticks array row.
 * @param {*} val
 * @return {?Array<anychart.enums.Interval|number>} Array of [unit, count] or null.
 * @private
 */
anychart.scales.StockScatterDateTime.prototype.normalizeTicksRow_ = function(val) {
  var unit = null, count;
  if (goog.isString(val)) {
    unit = anychart.enums.normalizeInterval(val, null);
    count = 1;
  } else if (goog.isObject(val)) {
    unit = anychart.enums.normalizeInterval(val['unit'], null);
    count = anychart.utils.normalizeToNaturalNumber(val['count']);
  }
  return unit ? [unit, count] : null;
};


/**
 * Returns true if passed string indicates Scatter scale.
 * @param {string} type
 * @return {boolean}
 */
anychart.scales.StockScatterDateTime.askedForScatter = function(type) {
  type = (type + '').toLowerCase();
  switch (type) {
    case 'linear':
    case 'scatter':
    case 'datetime':
    case 'simple':
      return true;
    default:
      return false;
  }
};


/**
 * Array of default tick settings.
 * @type {anychart.scales.StockScatterDateTime.TicksSettings}
 * @private
 */
anychart.scales.StockScatterDateTime.DEFAULT_TICKS_ = [
  {'minor': {'unit': anychart.enums.Interval.MILLISECOND, 'count': 1}, 'major': {'unit': anychart.enums.Interval.MILLISECOND, 'count': 5}},
  {'minor': {'unit': anychart.enums.Interval.MILLISECOND, 'count': 5}, 'major': {'unit': anychart.enums.Interval.MILLISECOND, 'count': 20}},
  {'minor': {'unit': anychart.enums.Interval.MILLISECOND, 'count': 20}, 'major': {'unit': anychart.enums.Interval.MILLISECOND, 'count': 100}},
  {'minor': {'unit': anychart.enums.Interval.MILLISECOND, 'count': 100}, 'major': {'unit': anychart.enums.Interval.MILLISECOND, 'count': 500}},
  {'minor': {'unit': anychart.enums.Interval.MILLISECOND, 'count': 500}, 'major': {'unit': anychart.enums.Interval.SECOND, 'count': 2}},
  {'minor': {'unit': anychart.enums.Interval.SECOND, 'count': 2}, 'major': {'unit': anychart.enums.Interval.SECOND, 'count': 10}},
  {'minor': {'unit': anychart.enums.Interval.SECOND, 'count': 10}, 'major': {'unit': anychart.enums.Interval.SECOND, 'count': 30}},
  {'minor': {'unit': anychart.enums.Interval.SECOND, 'count': 30}, 'major': {'unit': anychart.enums.Interval.MINUTE, 'count': 2}},
  {'minor': {'unit': anychart.enums.Interval.MINUTE, 'count': 2}, 'major': {'unit': anychart.enums.Interval.MINUTE, 'count': 10}},
  {'minor': {'unit': anychart.enums.Interval.MINUTE, 'count': 10}, 'major': {'unit': anychart.enums.Interval.MINUTE, 'count': 30}},
  {'minor': {'unit': anychart.enums.Interval.MINUTE, 'count': 30}, 'major': {'unit': anychart.enums.Interval.HOUR, 'count': 1}},
  {'minor': {'unit': anychart.enums.Interval.HOUR, 'count': 1}, 'major': {'unit': anychart.enums.Interval.HOUR, 'count': 3}},
  {'minor': {'unit': anychart.enums.Interval.HOUR, 'count': 3}, 'major': {'unit': anychart.enums.Interval.HOUR, 'count': 12}},
  {'minor': {'unit': anychart.enums.Interval.HOUR, 'count': 12}, 'major': {'unit': anychart.enums.Interval.DAY, 'count': 1}},
  {'minor': {'unit': anychart.enums.Interval.DAY, 'count': 1}, 'major': {'unit': anychart.enums.Interval.WEEK, 'count': 1}},
  {'minor': {'unit': anychart.enums.Interval.WEEK, 'count': 1}, 'major': {'unit': anychart.enums.Interval.MONTH, 'count': 1}},
  {'minor': {'unit': anychart.enums.Interval.MONTH, 'count': 1}, 'major': {'unit': anychart.enums.Interval.QUARTER, 'count': 1}},
  {'minor': {'unit': anychart.enums.Interval.QUARTER, 'count': 1}, 'major': {'unit': anychart.enums.Interval.SEMESTER, 'count': 1}},
  {'minor': {'unit': anychart.enums.Interval.SEMESTER, 'count': 1}, 'major': {'unit': anychart.enums.Interval.YEAR, 'count': 1}},
  {'minor': {'unit': anychart.enums.Interval.YEAR, 'count': 1}, 'major': {'unit': anychart.enums.Interval.YEAR, 'count': 2}},
  {'minor': {'unit': anychart.enums.Interval.YEAR, 'count': 2}, 'major': {'unit': anychart.enums.Interval.YEAR, 'count': 4}},
];


//proto['getTicks'] = proto.getTicks;
//proto['getMajorIntervalUnit'] = proto.getMajorIntervalUnit;
//proto['getMajorIntervalUnitCount'] = proto.getMajorIntervalUnitCount;
//proto['getMinorIntervalUnit'] = proto.getMinorIntervalUnit;
//proto['getMinorIntervalUnitCount'] = proto.getMinorIntervalUnitCount;


//exports
(function() {
  var proto = anychart.scales.StockScatterDateTime.prototype;
  proto['ticksCount'] = proto.ticksCount;
  proto['getFullMinimum'] = proto.getFullMinimum;
  proto['getFullMaximum'] = proto.getFullMaximum;
  proto['getMinimum'] = proto.getMinimum;
  proto['getMaximum'] = proto.getMaximum;
  proto['transform'] = proto.transform;
  proto['inverseTransform'] = proto.inverseTransform;
})();
