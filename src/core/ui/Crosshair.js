goog.provide('anychart.core.ui.Crosshair');

goog.require('anychart.core.VisualBase');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.CrosshairLabel');
goog.require('goog.array');



/**
 * Crosshair class.
 * @constructor
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.settings.IResolvable}
 */
anychart.core.ui.Crosshair = function() {
  anychart.core.ui.Crosshair.base(this, 'constructor');

  /**
   * @type {anychart.core.ChartWithAxes|anychart.mapModule.Chart|anychart.stockModule.Chart|anychart.stockModule.Plot}
   * @protected
   */
  this.chart = null;

  /**
   * If true, all default chart elements layout is swapped.
   * @type {boolean}
   * @private
   */
  this.barChartMode_ = false;

  /**
   * @type {anychart.core.Axis|anychart.mapModule.elements.Axis|anychart.stockModule.Axis}
   * @private
   */
  this.xAxis_ = null;

  /**
   * @type {anychart.core.Axis|anychart.mapModule.elements.Axis}
   * @private
   */
  this.yAxis_ = null;

  /**
   * @type {acgraph.vector.Path}
   * @protected
   */
  this.xLine = acgraph.path();

  /**
   * @type {acgraph.vector.Path}
   * @protected
   */
  this.yLine = acgraph.path();

  /**
   * @type {anychart.core.ui.CrosshairLabel}
   * @private
   */
  this.xLabel_ = new anychart.core.ui.CrosshairLabel();

  /**
   * @type {anychart.core.ui.CrosshairLabel}
   * @private
   */
  this.yLabel_ = new anychart.core.ui.CrosshairLabel();

  this.xLine.disablePointerEvents(true);
  this.yLine.disablePointerEvents(true);

  this.xLabel_.listenSignals(this.labelInvalidated, this);
  this.yLabel_.listenSignals(this.labelInvalidated, this);

  /**
   * This flag is used to auto enable or disable xLabel.
   * Used to correctly show xLabels for stock plots.
   * @type {boolean}
   * @private
   */
  this.xLabelAutoEnabled_ = true;

  /**
   * @type {boolean}
   * @private
   */
  this.needsForceSignalsDispatching_ = false;

  /**
   * Resolution chain cache.
   * @type {?Array.<Object|null|undefined>}
   * @private
   */
  this.resolutionChainCache_ = null;

  /**
   * Parent.
   * @type {?anychart.core.ui.Crosshair}
   * @private
   */
  this.parent_ = null;

  /**
   * @type {Object.<string, anychart.core.ui.Crosshair>}
   */
  this.childrenMap = {};

  /**
   * @this {anychart.core.ui.Crosshair}
   */
  var displayModeBeforeInvalidationHook = function() {
    this.bindHandlers();
  };

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['xStroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['yStroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['displayMode', 0, 0, 0, displayModeBeforeInvalidationHook]
  ]);
};
goog.inherits(anychart.core.ui.Crosshair, anychart.core.VisualBase);


//region -- Consistency states.
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.ui.Crosshair.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_REAPPLICATION;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.Crosshair.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE;


//endregion
//region -- Descriptors.
/**
 * Descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.Crosshair.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'xStroke',
      anychart.core.settings.strokeNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'yStroke',
      anychart.core.settings.strokeNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'displayMode',
      anychart.enums.normalizeCrosshairDisplayMode);

  return map;
})();
anychart.core.settings.populate(anychart.core.ui.Crosshair, anychart.core.ui.Crosshair.DESCRIPTORS);


//endregion
//region -- IResolvable impl.
/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.core.ui.Crosshair.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.core.ui.Crosshair.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.core.ui.Crosshair.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.core.ui.Crosshair.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_)
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  return sett;
};


/** @inheritDoc */
anychart.core.ui.Crosshair.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};


//endregion
//region -- Parental relations
/**
 * Gets/sets new parent title.
 * @param {anychart.core.ui.Crosshair=} opt_value - Value to set.
 * @return {anychart.core.ui.Crosshair} - Current value or itself for method chaining.
 */
anychart.core.ui.Crosshair.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parent_ != opt_value) {
      var uid = String(goog.getUid(this));
      if (goog.isNull(opt_value)) { //removing parent.
        //this.parent_ is not null here.
        this.parent_.unlistenSignals(this.parentInvalidated_, this);
        this.xLabel().parent(null);
        this.yLabel().parent(null);
        delete this.parent_.childrenMap[uid];
        this.parent_ = null;
      } else {
        if (this.parent_)
          this.parent_.unlistenSignals(this.parentInvalidated_, this);
        this.parent_ = opt_value;
        this.xLabel().parent(this.parent_.xLabel());
        this.yLabel().parent(this.parent_.yLabel());
        this.parent_.childrenMap[uid] = this;
        this.parent_.listenSignals(this.parentInvalidated_, this);
      }
    }
    return this;
  }
  return this.parent_;

};


/**
 * Parent invalidation handler.
 * @param {anychart.SignalEvent} e - Signal event.
 * @private
 */
anychart.core.ui.Crosshair.prototype.parentInvalidated_ = function(e) {
  var state = 0;
  var signal = 0;

  if (e.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state |= anychart.ConsistencyState.APPEARANCE;
    signal |= anychart.Signal.NEEDS_REDRAW;
  }

  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state |= anychart.ConsistencyState.BOUNDS;
    signal |= anychart.Signal.BOUNDS_CHANGED;
  }

  if (e.hasSignal(anychart.Signal.ENABLED_STATE_CHANGED)) {
    state |= anychart.ConsistencyState.ENABLED;
    signal |= anychart.Signal.ENABLED_STATE_CHANGED | anychart.Signal.NEEDS_REDRAW;
  }

  this.resolutionChainCache_ = null;

  this.invalidate(state, signal);
};


//endregion
//region -- Common.
/**
 * Internal label invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @protected
 */
anychart.core.ui.Crosshair.prototype.labelInvalidated = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
  }
};


/**
 *
 * @param {boolean=} opt_value
 * @return {!(boolean|anychart.core.ui.Crosshair)}
 */
anychart.core.ui.Crosshair.prototype.barChartMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (this.barChartMode_ != opt_value) {
      this.barChartMode_ = opt_value;
    }
    return this;
  } else {
    return this.barChartMode_;
  }
};


/**
 *
 * @param {(anychart.core.Axis|anychart.mapModule.elements.Axis|anychart.stockModule.Axis)=} opt_value
 * @return {anychart.core.Axis|anychart.mapModule.elements.Axis|anychart.stockModule.Axis|anychart.core.ui.Crosshair}
 */
anychart.core.ui.Crosshair.prototype.xAxis = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.xAxis_ != opt_value) {
      this.suspendSignalsDispatching();
      // set format
      if (!this.xLabel_.format() ||
          (this.xAxis_ && this.xLabel_.format() == this.xAxis_.labels().getOption('format'))) {

        this.xLabel_.format(/** @type {Function} */(opt_value.labels().getOption('format')));
      }

      // set anchor
      this.xLabel_.autoAnchor(this.getAnchorByAxis_(opt_value));

      this.xAxis_ = opt_value;
      this.resumeSignalsDispatching(true);
    }
    return this;
  } else {
    return this.xAxis_;
  }
};


/**
 *
 * @param {(anychart.core.Axis|anychart.mapModule.elements.Axis)=} opt_value
 * @return {anychart.core.Axis|anychart.mapModule.elements.Axis|anychart.core.ui.Crosshair}
 */
anychart.core.ui.Crosshair.prototype.yAxis = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.yAxis_ != opt_value) {
      this.suspendSignalsDispatching();
      // set format
      if (!this.yLabel_.format() ||
          (this.yAxis_ && this.yLabel_.format() == this.yAxis_.labels()['format']())) {

        this.yLabel_.format(/** @type {Function} */(opt_value.labels()['format']()));
      }

      // set anchor
      this.yLabel_.autoAnchor(this.getAnchorByAxis_(opt_value));

      this.yAxis_ = opt_value;
      this.resumeSignalsDispatching(true);
    }
    return this;
  } else {
    return this.yAxis_;
  }
};


/**
 *
 * @param {anychart.core.Axis|anychart.mapModule.elements.Axis|anychart.stockModule.Axis} axis
 * @return {anychart.enums.Anchor}
 * @private
 */
anychart.core.ui.Crosshair.prototype.getAnchorByAxis_ = function(axis) {
  switch (axis.orientation()) {
    case anychart.enums.Orientation.LEFT:
      return anychart.enums.Anchor.RIGHT_CENTER;
    case anychart.enums.Orientation.TOP:
      return anychart.enums.Anchor.CENTER_BOTTOM;
    case anychart.enums.Orientation.RIGHT:
      return anychart.enums.Anchor.LEFT_CENTER;
    case anychart.enums.Orientation.BOTTOM:
      return anychart.enums.Anchor.CENTER_TOP;
    default:
      return anychart.enums.Anchor.LEFT_TOP;
  }
};


/**
 * Getter crosshair xLabel
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.core.ui.CrosshairLabel|anychart.core.ui.Crosshair}
 */
anychart.core.ui.Crosshair.prototype.xLabel = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.xLabel_.setup(opt_value);
    return this;
  } else {
    return this.xLabel_;
  }
};


/**
 * Getter crosshair yLabel
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.core.ui.CrosshairLabel|anychart.core.ui.Crosshair}
 */
anychart.core.ui.Crosshair.prototype.yLabel = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.yLabel_.setup(opt_value);
    return this;
  } else {
    return this.yLabel_;
  }
};


//endregion
//region -- Draw.
/**
 * Create xLine, yLine and Labels
 * @return {!anychart.core.ui.Crosshair} {@link anychart.core.ui.Crosshair} instance for method chaining.
 */
anychart.core.ui.Crosshair.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  var bounds = /** @type {anychart.math.Rect} */(this.parentBounds());
  var zIndex = /** @type {number} */(this.zIndex());
  var container = /** @type {acgraph.vector.ILayer} */(this.container());

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.xLine.stroke(/** @type {acgraph.vector.Stroke} */ (this.getOption('xStroke')));
    this.yLine.stroke(/** @type {acgraph.vector.Stroke} */ (this.getOption('yStroke')));

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.xLine.parent(container);
    this.yLine.parent(container);

    this.xLabel_.container(container);
    this.yLabel_.container(container);

    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.xLine.zIndex(zIndex);
    this.yLine.zIndex(zIndex);

    this.xLabel_.setAutoZIndex(zIndex);
    this.yLabel_.setAutoZIndex(zIndex);

    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.xLabel_.parentBounds(bounds);
    this.yLabel_.parentBounds(bounds);

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  return this;
};


/**
 * Whether to dispatch signals even if current consistency state is not effective.
 * @param {boolean=} opt_value - Value to set.
 * @return {boolean|anychart.core.ui.Crosshair}
 */
anychart.core.ui.Crosshair.prototype.needsForceSignalsDispatching = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.needsForceSignalsDispatching_ = opt_value;
    return this;
  }
  return this.needsForceSignalsDispatching_;
};


/**
 * @inheritDoc
 */
anychart.core.ui.Crosshair.prototype.invalidate = function(state, opt_signal) {
  var effective = anychart.core.ui.Crosshair.base(this, 'invalidate', state, opt_signal);
  if (!effective && this.needsForceSignalsDispatching())
    this.dispatchSignal(opt_signal || 0);
  return effective;
};


//endregion
/**
 *
 * @param {(anychart.core.ChartWithAxes|anychart.mapModule.Chart|anychart.stockModule.Chart|anychart.stockModule.Plot)=} opt_chart
 */
anychart.core.ui.Crosshair.prototype.bindHandlers = function(opt_chart) {
  if (opt_chart) {
    this.chart = opt_chart;
  }

  if (this.getOption('displayMode') == anychart.enums.CrosshairDisplayMode.STICKY) {
    this.chart.unlisten(acgraph.events.EventType.MOUSEOVER, this.handleMouseOverAndMove, false, this);
    this.chart.unlisten(acgraph.events.EventType.MOUSEMOVE, this.handleMouseOverAndMove, false, this);
    this.chart.unlisten(acgraph.events.EventType.MOUSEOUT, this.handleMouseOut, false, this);
    this.chart.listen(anychart.enums.EventType.POINTS_HOVER, this.show, false, this);
  } else { // float
    this.chart.unlisten(anychart.enums.EventType.POINTS_HOVER, this.show, false, this);
    this.chart.listen(acgraph.events.EventType.MOUSEOVER, this.handleMouseOverAndMove, false, this);
    this.chart.listen(acgraph.events.EventType.MOUSEMOVE, this.handleMouseOverAndMove, false, this);
    this.chart.listen(acgraph.events.EventType.MOUSEOUT, this.handleMouseOut, false, this);
  }
};


/**
 * Handler for sticky mode.
 * @param {anychart.core.MouseEvent} event
 * @protected
 */
anychart.core.ui.Crosshair.prototype.show = function(event) {
  var toShowSeriesStatus = [];
  var statuses = event['seriesStatus'];
  for (var i = 0; i < statuses.length; i++) {
    var status = statuses[i];
    if (status['series'].enabled() && !goog.array.isEmpty(status['points'])) {
      toShowSeriesStatus.push(status);
    }
  }

  if (toShowSeriesStatus.length) {
    var nearestSeriesStatus = toShowSeriesStatus[0];
    toShowSeriesStatus[0]['series'].getIterator().select(toShowSeriesStatus[0]['nearestPointToCursor']['index']);

    for (i = 0; i < toShowSeriesStatus.length; i++) {
      var seriesStatus = toShowSeriesStatus[i];
      if (nearestSeriesStatus['nearestPointToCursor']['distance'] > seriesStatus['nearestPointToCursor']['distance']) {
        seriesStatus['series'].getIterator().select(seriesStatus['nearestPointToCursor']['index']);
        nearestSeriesStatus = seriesStatus;
      }
    }

    var series = nearestSeriesStatus['series'];

    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    var bounds = this.parentBounds();
    var chartOffset = container.getStage().getClientPosition();


    var shiftX = this.xLine.strokeThickness() % 2 == 0 ? 0 : -.5;
    var shiftY = this.yLine.strokeThickness() % 2 == 0 ? 0 : -.5;

    var xScale = series.xScale();

    var iterator = series.getIterator();
    var x = anychart.utils.toNumber(iterator.meta('x'));
    var mouseX = event['originalEvent'] - chartOffset.x;
    var y = event['originalEvent']['clientY'] - chartOffset.y;

    var xStroke = this.getOption('xStroke');
    var yStroke = this.getOption('yStroke');

    if (xStroke && xStroke != 'none') {
      var xLineCoord;
      this.xLine.clear();

      // one pixel shift with clamp
      xLineCoord = goog.math.clamp(x, bounds.getLeft(), bounds.getRight() - 1);
      xLineCoord = Math.round(xLineCoord) - shiftX;
      this.xLine
          .moveTo(xLineCoord, bounds.getTop())
          .lineTo(xLineCoord, bounds.getBottom());
    }

    if (this.xAxis_ && this.xAxis_.enabled() && this.xLabel_.enabled()) {
      var xLabelFormatProvider = this.getLabelsFormatProvider(this.xAxis_, xScale.transform(iterator.get('x')));
      var xLabelFormat = this.xLabel_.format() || anychart.utils.DEFAULT_FORMATTER;
      this.xLabel_.text(xLabelFormat.call(xLabelFormatProvider, xLabelFormatProvider));
      var xLabelPosition = this.getLabelPosition_(this.xAxis_, this.xLabel_, x, y, xScale.transform(iterator.get('x')));
      this.xLabel_.x(/** @type {number}*/(xLabelPosition.x)).y(/** @type {number}*/(xLabelPosition.y));
      this.xLabel_.container(container).draw();
    }


    if (yStroke && yStroke != 'none') {
      var yLineCoord;
      this.yLine.clear();

      yLineCoord = goog.math.clamp(y, bounds.getTop(), bounds.getBottom() - 1);
      yLineCoord = Math.round(yLineCoord) - shiftY;
      this.yLine
          .moveTo(bounds.getLeft(), yLineCoord)
          .lineTo(bounds.getRight(), yLineCoord);
    }

    if (this.yAxis_ && this.yAxis_.enabled() && this.yLabel_.enabled()) {
      var width = bounds.getRight() - bounds.getLeft();
      var height = bounds.getBottom() - bounds.getTop();
      var dataPlotOffsetX = mouseX - bounds.getLeft();
      var dataPlotOffsetY = y - bounds.getTop();
      var yRatio = this.barChartMode_ ? dataPlotOffsetX / width : (height - dataPlotOffsetY) / height;

      var yLabelFormatProvider = this.getLabelsFormatProvider(this.yAxis_, yRatio);
      var yLabelFormat = this.yLabel_.format() || anychart.utils.DEFAULT_FORMATTER;
      this.yLabel_.text(yLabelFormat.call(yLabelFormatProvider, yLabelFormatProvider));
      var yLabelPosition = this.getLabelPosition_(this.yAxis_, this.yLabel_, x, y, yRatio);
      this.yLabel_.x(/** @type {number}*/(yLabelPosition.x)).y(/** @type {number}*/(yLabelPosition.y));
      this.yLabel_.container(container).draw();
    }

  } else {
    this.hide();
  }
};


/**
 * Handler for sticky mode.
 */
anychart.core.ui.Crosshair.prototype.hide = function() {
  this.hideX();
  this.hideY();
};


/**
 * Removes x-part of crosshair.
 * @protected
 */
anychart.core.ui.Crosshair.prototype.hideX = function() {
  this.xLine.clear();
  this.xLabel_.container(null);
  this.xLabel_.remove();
};


/**
 * Removes y-part of crosshair.
 * @protected
 */
anychart.core.ui.Crosshair.prototype.hideY = function() {
  this.yLine.clear();
  this.yLabel_.container(null);
  this.yLabel_.remove();
};


/**
 * Checks whether scale for axis can return a value.
 * @param {anychart.core.Axis|anychart.mapModule.elements.Axis|anychart.stockModule.Axis} axis Axis.
 * @return {boolean} Is scale of axis can resolve defined ratio.
 */
anychart.core.ui.Crosshair.prototype.canDrawForAxis = function(axis) {
  return goog.isDef(axis.scale().inverseTransform(0));
};


/**
 * Handler for float mode.
 * @param {anychart.core.MouseEvent} e Event object.
 * @protected
 */
anychart.core.ui.Crosshair.prototype.handleMouseOverAndMove = function(e) {
  if (!this.enabled()) return;

  var container = /** @type {acgraph.vector.ILayer} */(this.container());
  var bounds = this.parentBounds();
  var chartOffset = this.container().getStage().getClientPosition();

  var mouseX = e['clientX'] - chartOffset.x;
  var mouseY = e['clientY'] - chartOffset.y;

  if (mouseX >= bounds.getLeft() && mouseX <= bounds.getRight() &&
      mouseY >= bounds.getTop() && mouseY <= bounds.getBottom()) {

    var shiftX = this.xLine.strokeThickness() % 2 == 0 ? 0 : -.5;
    var shiftY = this.yLine.strokeThickness() % 2 == 0 ? 0 : -.5;

    var width = bounds.getRight() - bounds.getLeft();
    var height = bounds.getBottom() - bounds.getTop();
    var dataPlotOffsetX = mouseX - bounds.getLeft();
    var dataPlotOffsetY = mouseY - bounds.getTop();

    var yRatio;
    if (this.barChartMode_) {
      yRatio = dataPlotOffsetX / width;
    } else {
      yRatio = (height - dataPlotOffsetY) / height;
    }

    if (this.xAxis_ && this.canDrawForAxis(this.xAxis_)) {
      this.drawXLine_(mouseX, mouseY);
      this.drawXLabel_(mouseX, mouseY);
    } else {
      this.hideX();
    }

    if (this.yAxis_ && this.canDrawForAxis(this.yAxis_)) {
      var yStroke = this.getOption('yStroke');
      if (yStroke && yStroke != 'none') {
        var yLineCoord;
        this.yLine.clear();

        if (this.yAxis_.isHorizontal()) {
          yLineCoord = goog.math.clamp(this.prepareCoordinate_(this.yAxis_, yRatio, mouseX), bounds.getLeft(), bounds.getRight() - 1);
          this.yLine
              .moveTo(yLineCoord - shiftX, bounds.getTop())
              .lineTo(yLineCoord - shiftX, bounds.getBottom());
        } else {
          yLineCoord = goog.math.clamp(this.prepareCoordinate_(this.yAxis_, yRatio, mouseY), bounds.getTop(), bounds.getBottom() - 1);
          this.yLine
              .moveTo(bounds.getLeft(), yLineCoord - shiftY)
              .lineTo(bounds.getRight(), yLineCoord - shiftY);
        }
      }

      if (this.yLabel_.enabled()) {
        var yLabelFormatProvider = this.getLabelsFormatProvider(this.yAxis_, yRatio);
        var yLabelFormat = this.yLabel_.format() || anychart.utils.DEFAULT_FORMATTER;
        this.yLabel_.text(yLabelFormat.call(yLabelFormatProvider, yLabelFormatProvider));
        var yLabelPosition = this.getLabelPosition_(this.yAxis_, this.yLabel_, mouseX, mouseY, yRatio);
        this.yLabel_.x(/** @type {number}*/(yLabelPosition.x)).y(/** @type {number}*/(yLabelPosition.y));
        this.yLabel_.container(container).draw();
      }
    } else {
      this.hideY();
    }

  } else {
    this.hide();
  }
};


/**
 * Draws xLabel.
 * @param {number} mouseX - .
 * @param {number} mouseY - .
 * @private
 */
anychart.core.ui.Crosshair.prototype.drawXLabel_ = function(mouseX, mouseY) {
  if (this.xLabel_.enabled() && this.xLabelAutoEnabled_) {
    var bounds = this.parentBounds();
    var width = bounds.getRight() - bounds.getLeft();
    var dataPlotOffsetX = mouseX - bounds.getLeft();
    var xRatio = dataPlotOffsetX / width;

    var xLabelFormatProvider = this.getLabelsFormatProvider(this.xAxis_, xRatio);
    var xLabelFormat = this.xLabel_.format() || anychart.utils.DEFAULT_FORMATTER;
    this.xLabel_.text(xLabelFormat.call(xLabelFormatProvider, xLabelFormatProvider));
    var xLabelPosition = this.getLabelPosition_(this.xAxis_, this.xLabel_, mouseX, mouseY, xRatio);
    this.xLabel_.x(/** @type {number}*/(xLabelPosition.x)).y(/** @type {number}*/(xLabelPosition.y));
    this.xLabel_.container(/** @type {acgraph.vector.ILayer} */(this.container())).draw();
  }
};


/**
 * This flag is used to auto enable or disable xLabel.
 * Used to correctly show xLabels for stock plots.
 * @param {boolean=} opt_value - Value to set.
 * @return {boolean|anychart.core.ui.Crosshair}
 */
anychart.core.ui.Crosshair.prototype.xLabelAutoEnabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.xLabelAutoEnabled_ = opt_value;
    return this;
  }
  return this.xLabelAutoEnabled_;
};


/**
 * Draws X line.
 * @param {number} mouseX - .
 * @param {number} mouseY - .
 * @private
 */
anychart.core.ui.Crosshair.prototype.drawXLine_ = function(mouseX, mouseY) {
  var xStroke = this.getOption('xStroke');
  if (xStroke && xStroke != 'none') {
    var bounds = this.parentBounds();
    var dataPlotOffsetX = mouseX - bounds.getLeft();
    var width = bounds.getRight() - bounds.getLeft();
    var xRatio = dataPlotOffsetX / width;
    var shiftX = this.xLine.strokeThickness() % 2 == 0 ? 0 : -.5;
    var shiftY = this.yLine.strokeThickness() % 2 == 0 ? 0 : -.5;

    var xLineCoord;
    this.xLine.clear();

    if (this.xAxis_.isHorizontal()) {
      // one pixel shift with clamp
      xLineCoord = goog.math.clamp(this.prepareCoordinate_(this.xAxis_, xRatio, mouseX), bounds.getLeft(), bounds.getRight() - 1);
      this.xLine
          .moveTo(xLineCoord - shiftX, bounds.getTop())
          .lineTo(xLineCoord - shiftX, bounds.getBottom());
    } else {
      xLineCoord = goog.math.clamp(this.prepareCoordinate_(this.xAxis_, xRatio, mouseY), bounds.getTop(), bounds.getBottom() - 1);
      this.xLine
          .moveTo(bounds.getLeft(), xLineCoord - shiftY)
          .lineTo(bounds.getRight(), xLineCoord - shiftY);
    }
  }
};


/**
 * For Shock chart: highlights vertical line.
 * @param {number} x - X coordinate got from plot mouse move event.
 * @param {boolean=} opt_showXLabel - Whether to show xLabel.
 * @param {boolean=} opt_hideY -  Whether to hide Y line and label.
 */
anychart.core.ui.Crosshair.prototype.autoHighlightX = function(x, opt_showXLabel, opt_hideY) {
  if (opt_hideY)
    this.hideY();

  if (opt_showXLabel) {
    this.drawXLabel_(x, 0);
  } else {
    this.xLabel_.container(null).remove();
  }
  this.drawXLine_(x, 0);
};


/**
 * Get the coordinate on the axis scale, given the type of scale.
 * @param {anychart.core.Axis|anychart.mapModule.elements.Axis|anychart.stockModule.Axis} axis
 * @param {number} ratio Current ratio.
 * @param {number} coord Current mouse coordinate.
 * @return {number}
 * @private
 */
anychart.core.ui.Crosshair.prototype.prepareCoordinate_ = function(axis, ratio, coord) {
  var bounds = this.parentBounds();
  var scale = axis.scale();
  var isOrdinal = scale.getType() == anychart.enums.ScaleTypes.ORDINAL;
  var centerRatio = scale.transform(scale.inverseTransform(ratio), .5);

  if (axis.isHorizontal()) {
    return isOrdinal ? Math.round(bounds.left + centerRatio * bounds.width) : coord;
  } else {
    return isOrdinal ? Math.round(bounds.top + bounds.height - centerRatio * bounds.height) : coord;
  }
};


/**
 * Get the label position, given the type of scale and axis orientation.
 * @param {anychart.core.Axis|anychart.mapModule.elements.Axis|anychart.stockModule.Axis} axis
 * @param {anychart.core.ui.CrosshairLabel} label
 * @param {number} mouseX
 * @param {number} mouseY
 * @param {number} ratio Current ratio.
 * @return {anychart.math.CoordinateObject}
 * @private
 */
anychart.core.ui.Crosshair.prototype.getLabelPosition_ = function(axis, label, mouseX, mouseY, ratio) {
  var bounds = this.parentBounds();
  var x = 0, y = 0;

  if (!axis) return {x: x, y: y};

  var scale = axis.scale();
  var axisBounds = axis.getPixelBounds();

  var isOrdinal = scale.getType() == anychart.enums.ScaleTypes.ORDINAL;
  var centerRatio = scale.transform(scale.inverseTransform(ratio), .5);
  var shift = 1;

  var axisEnabled = axis.enabled();
  var left = axisEnabled ? axisBounds.getLeft() : bounds.getRight();
  var top = axisEnabled ? axisBounds.getTop() : bounds.getBottom();
  var right = axisEnabled ? axisBounds.getRight() : bounds.getLeft();
  var bottom = axisEnabled ? axisBounds.getBottom() : bounds.getTop();

  switch (axis.orientation()) {
    case anychart.enums.Orientation.LEFT:
      x = this.isLabelAnchorLeft(label) ? right - shift : right + shift;
      y = isOrdinal ? Math.round(bounds.top + bounds.height - centerRatio * bounds.height) : mouseY;
      break;
    case anychart.enums.Orientation.TOP:
      x = isOrdinal ? Math.round(bounds.left + centerRatio * bounds.width) : mouseX;
      y = this.isLabelAnchorTop(label) ? bottom - shift : bottom + shift;
      break;
    case anychart.enums.Orientation.RIGHT:
      x = this.isLabelAnchorLeft(label) ? left - shift : left + shift;
      y = isOrdinal ? Math.round(bounds.top + bounds.height - centerRatio * bounds.height) : mouseY;
      break;
    case anychart.enums.Orientation.BOTTOM:
      x = isOrdinal ? Math.round(bounds.left + centerRatio * bounds.width) : mouseX;
      y = this.isLabelAnchorTop(label) ? top - shift : top + shift;
      break;
  }

  return {x: x, y: y};
};


/**
 *
 * @param {anychart.core.ui.CrosshairLabel} label
 * @return {boolean}
 */
anychart.core.ui.Crosshair.prototype.isLabelAnchorLeft = function(label) {
  var anchor = label.getFinalAnchor();
  return anchor == anychart.enums.Anchor.LEFT_TOP ||
      anchor == anychart.enums.Anchor.LEFT_CENTER ||
      anchor == anychart.enums.Anchor.LEFT_BOTTOM;
};


/**
 *
 * @param {anychart.core.ui.CrosshairLabel} label
 * @return {boolean}
 */
anychart.core.ui.Crosshair.prototype.isLabelAnchorTop = function(label) {
  var anchor = label.getFinalAnchor();
  return anchor == anychart.enums.Anchor.LEFT_TOP ||
      anchor == anychart.enums.Anchor.CENTER_TOP ||
      anchor == anychart.enums.Anchor.RIGHT_TOP;
};


/**
 * Gets format provider for label.
 * @param {anychart.core.Axis|anychart.mapModule.elements.Axis|anychart.stockModule.Axis} axis
 * @param {number} ratio
 * @return {Object} Labels format provider.
 * @protected
 */
anychart.core.ui.Crosshair.prototype.getLabelsFormatProvider = function(axis, ratio) {
  if (!axis) return null;

  var scale = axis.scale();
  var scaleType = scale.getType();
  var scaleValue = scale.inverseTransform(ratio);

  var labelText;
  var tickValue;
  switch (scaleType) {
    case anychart.enums.ScaleTypes.LINEAR:
      labelText = +parseFloat(scaleValue).toFixed();
      break;
    case anychart.enums.ScaleTypes.LOG:
      labelText = +scaleValue.toFixed(1);
      break;
    case anychart.enums.ScaleTypes.ORDINAL:
      labelText = String(scaleValue);
      break;
    case anychart.enums.ScaleTypes.STOCK_SCATTER_DATE_TIME:
    case anychart.enums.ScaleTypes.STOCK_ORDINAL_DATE_TIME:
    case anychart.enums.ScaleTypes.DATE_TIME:
      var date = new Date(scaleValue);
      var mm = date.getMonth() + 1;
      var dd = date.getDate();
      var yy = date.getFullYear();

      mm = mm < 10 ? '0' + mm : '' + mm;
      dd = dd < 10 ? '0' + dd : '' + dd;

      labelText = mm + '-' + dd + '-' + yy;
      tickValue = scaleValue;

      break;
  }

  return {
    'value': labelText,
    'rawValue': scaleValue,
    'max': scale.max ? scale.max : null,
    'min': scale.min ? scale.min : null,
    'scale': scale,
    'tickValue': tickValue
  };
};


/**
 * Handler for float mode.
 * @param {anychart.core.MouseEvent} e Event object.
 * @protected
 */
anychart.core.ui.Crosshair.prototype.handleMouseOut = function(e) {
  var bounds = this.parentBounds();

  var offsetX = e['offsetX'];
  var offsetY = e['offsetY'];

  if ((offsetX <= bounds.getLeft() || offsetX >= bounds.getRight()) ||
      (offsetY <= bounds.getTop() || offsetY >= bounds.getBottom())) {

    this.hide();
  }
};


/** @inheritDoc */
anychart.core.ui.Crosshair.prototype.remove = function() {
  this.hide();
};


//region -- Disposing.
/** @inheritDoc */
anychart.core.ui.Crosshair.prototype.disposeInternal = function() {
  if (this.chart) {
    this.chart.unlisten(acgraph.events.EventType.MOUSEOVER, this.handleMouseOverAndMove, false, this);
    this.chart.unlisten(acgraph.events.EventType.MOUSEMOVE, this.handleMouseOverAndMove, false, this);
    this.chart.unlisten(acgraph.events.EventType.MOUSEOUT, this.handleMouseOut, false, this);
    this.chart.unlisten(anychart.enums.EventType.POINTS_HOVER, this.show, false, this);
    this.chart = null;
  }

  goog.dispose(this.xLine);
  this.xLine = null;

  goog.dispose(this.yLine);
  this.yLine = null;

  this.xAxis_ = null;
  this.yAxis_ = null;

  goog.dispose(this.xLabel_);
  this.xLabel_ = null;

  goog.dispose(this.yLabel_);
  this.yLabel_ = null;

  anychart.core.ui.Crosshair.base(this, 'disposeInternal');
};


//endregion
//region -- Serialize/Deserialize.
/** @inheritDoc */
anychart.core.ui.Crosshair.prototype.serialize = function() {
  var json = anychart.core.ui.Crosshair.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.core.ui.Crosshair.DESCRIPTORS, json, 'Crosshair');
  json['xLabel'] = this.xLabel_.serialize();
  json['yLabel'] = this.yLabel_.serialize();
  return json;
};


/** @inheritDoc */
anychart.core.ui.Crosshair.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.Crosshair.base(this, 'setupByJSON', config, opt_default);

  if (opt_default) {
    anychart.core.settings.copy(this.themeSettings, anychart.core.ui.Crosshair.DESCRIPTORS, config);
  } else {
    anychart.core.settings.deserialize(this, anychart.core.ui.Crosshair.DESCRIPTORS, config);
  }
  this.xLabel().setupInternal(!!opt_default, config['xLabel']);
  this.yLabel().setupInternal(!!opt_default, config['yLabel']);
};


//endregion
//exports
(function() {
  var proto = anychart.core.ui.Crosshair.prototype;
  proto['xLabel'] = proto.xLabel;
  proto['yLabel'] = proto.yLabel;
})();
