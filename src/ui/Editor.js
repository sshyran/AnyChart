goog.provide('anychart.ui.Editor');
goog.provide('anychart.ui.Editor.Dialog');

goog.require('anychart.ui.Component');
goog.require('anychart.ui.Preloader');
goog.require('anychart.ui.chartEditor.Controller');
goog.require('anychart.ui.chartEditor.events');
goog.require('anychart.ui.chartEditor.steps.ChartType');
goog.require('anychart.ui.chartEditor.steps.Data');
goog.require('anychart.ui.chartEditor.steps.Settings');
goog.require('goog.fx.AnimationSerialQueue');
goog.require('goog.fx.Transition.EventType');
goog.require('goog.fx.dom');
goog.require('goog.net.ImageLoader');
goog.require('goog.ui.Dialog');



/**
 * Chart Editor Component Class.
 * @constructor
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @extends {anychart.ui.Component}
 */
anychart.ui.Editor = function(opt_domHelper) {
  anychart.ui.Editor.base(this, 'constructor', opt_domHelper);

  /**
   * @type {?goog.ui.Dialog}
   * @private
   */
  this.dialog_ = null;

  /**
   * Current step.
   * @type {anychart.ui.chartEditor.steps.Base}
   * @private
   */
  this.currentStep_ = null;

  /**
   * Shared model for all steps.
   * @type {anychart.ui.chartEditor.steps.Base.Model}
   * @private
   */
  this.sharedModel_ = /** @type {anychart.ui.chartEditor.steps.Base.Model} */({
    window: goog.dom.getWindow(),
    anychart: /** @type {Object} */(goog.dom.getWindow()['anychart']),

    currentStep: null,
    steps: [],

    dataSets: [],
    dataMappings: [],
    seriesMappings: {},
    chartMapping: 0,
    lastSeriesId: 0,

    presets: {},
    presetsList: [],
    presetCategory: 'column',
    presetType: 'column',
    presetSettings: [],

    chart: null,
    isSeriesBased: true,
    chartContainer: null,
    chartConstructor: 'column',
    seriesType: 'column'
  });
  this.sharedModel_['anychart'] = this.sharedModel_.anychart;

  this.controller_ = new anychart.ui.chartEditor.Controller(this);

  this.addChild(new anychart.ui.chartEditor.steps.Data());
  this.addChild(new anychart.ui.chartEditor.steps.ChartType());
  this.addChild(new anychart.ui.chartEditor.steps.Settings());

  this.updateModelInSteps_();
  this.updateStepsDescriptors_();

  this.sharedModel_.presets = {
    'line': {
      category: 'line', caption: 'Line Charts', ctor: 'line', isSeriesBased: true,
      list: [
        {type: 'line', caption: 'Line Chart', image: 'line-chart/thumb.png', seriesType: 'line', referenceNames: ['x', 'value']},
        {type: 'spline', caption: 'Spline Chart', image: 'spline-chart/thumb.png', seriesType: 'spline', referenceNames: ['x', 'value']},
        {type: 'step-line', caption: 'Step-line Chart', image: 'step-line-chart/thumb.png', seriesType: 'stepLine', referenceNames: ['x', 'value']}
      ]
    },
    'area': {
      category: 'area', caption: 'Area Charts', ctor: 'area', isSeriesBased: true,
      list: [
        {type: 'area', caption: 'Area Chart', image: 'area-chart/thumb.png', seriesType: 'area', referenceNames: ['x', 'value']},
        {type: 'spline-area', caption: 'Spline Area Chart', image: 'spline-area-chart/thumb.png', seriesType: 'splineArea', referenceNames: ['x', 'value']},
        {type: 'step-area', caption: 'Step-line Area Chart', image: 'step-area-chart/thumb.png', seriesType: 'stepArea', referenceNames: ['x', 'value']},

        {
          type: 'stacked-area', caption: 'Stacked Area Chart', image: 'stacked-area-chart/thumb.png', seriesType: 'area', referenceNames: ['x', 'value'],
          settings: {
            'chart.yScale().stackMode()': 'value'
          }
        },
        {
          type: 'stacked-spline-area', caption: 'Stacked Spline Area Chart', image: 'stacked-spline-area-chart/thumb.png',
          seriesType: 'splineArea', referenceNames: ['x', 'value'],
          settings: {
            'chart.yScale().stackMode()': 'value'
          }
        },
        {
          type: 'stacked-step-area', caption: 'Stacked Step-line Area Chart', image: 'stacked-step-area-chart/thumb.png',
          seriesType: 'stepArea', referenceNames: ['x', 'value'],
          settings: {
            'chart.yScale().stackMode()': 'value'
          }
        },

        {
          type: 'percent-stacked-area', caption: 'Percent Stacked Area Chart', image: 'percent-stacked-area-chart/thumb.png',
          seriesType: 'area', referenceNames: ['x', 'value'],
          settings: {
            'chart.yScale().stackMode()': 'percent'
          }
        },
        {
          type: 'percent-stacked-spline-area', caption: 'Percent Stacked Spline Area Chart', image: 'percent-stacked-spline-area-chart/thumb.png',
          seriesType: 'splineArea', referenceNames: ['x', 'value'],
          settings: {
            'chart.yScale().stackMode()': 'percent'
          }
        },
        {
          type: 'percent-stacked-step-line-area', caption: 'Percent Stacked Step-line Area Chart', image: 'percent-stacked-step-area-chart/thumb.png',
          seriesType: 'stepArea', referenceNames: ['x', 'value'],
          settings: {
            'chart.yScale().stackMode()': 'percent'
          }
        },

        {
          type: 'range-area', caption: 'Range Area Chart', image: 'range-area-chart/thumb.png',
          seriesType: 'rangeArea', referenceNames: ['x', 'low', 'high']
        },
        {
          type: 'range-spline-area', caption: 'Range Spline Area Chart', image: 'range-spline-area-chart/thumb.png',
          seriesType: 'rangeSplineArea', referenceNames: ['x', 'low', 'high']
        },
        {
          type: 'range-step-area', caption: 'Range Step-line Area Chart', image: 'range-step-area-chart/thumb.png',
          seriesType: 'rangeStepArea', referenceNames: ['x', 'low', 'high']
        },

        // 3D
        {type: 'area3d', caption: '3D Area Chart', image: 'area3d-chart/thumb.png', ctor: 'area3d', seriesType: 'area', referenceNames: ['x', 'value']},
        {
          type: 'stacked-area3d', caption: 'Stacked 3D Area Chart', image: 'stacked-area3d-chart/thumb.png',
          ctor: 'area3d', seriesType: 'area', referenceNames: ['x', 'value'],
          settings: {
            'chart.yScale().stackMode()': 'value'
          }
        },
        {
          type: 'percent-stacked-area3d', caption: 'Percent Stacked 3D Area Chart', image: 'percent-stacked-area3d-chart/thumb.png',
          ctor: 'area3d', seriesType: 'area', referenceNames: ['x', 'value'],
          settings: {
            'chart.yScale().stackMode()': 'percent'
          }
        }
      ]
    },
    'column': {
      category: 'column', caption: 'Column Charts', ctor: 'column', isSeriesBased: true,
      list: [
        {type: 'column', caption: 'Column Chart', image: 'column-chart/thumb.png', seriesType: 'column', referenceNames: ['x', 'value']},
        {
          type: 'stacked-column', caption: 'Stacked Column Chart', image: 'stacked-column-chart/thumb.png',
          seriesType: 'column', referenceNames: ['x', 'value'],
          settings: {
            'chart.yScale().stackMode()': 'value'
          }
        },
        {
          type: 'percent-stacked-column', caption: 'Percent Stacked Column Chart', image: 'percent-stacked-column-chart/thumb.png',
          seriesType: 'column', referenceNames: ['x', 'value'],
          settings: {
            'chart.yScale().stackMode()': 'percent'
          }
        },
        {
          type: 'range-column', caption: 'Range Column Chart', image: 'range-column-chart/thumb.png',
          seriesType: 'rangeColumn', referenceNames: ['x', 'low', 'high']
        },

        // 3D
        {
          type: 'column3d', caption: '3D Column Chart', image: 'column3d-chart/thumb.png',
          ctor: 'column3d', seriesType: 'column', referenceNames: ['x', 'value']
        },
        {
          type: 'stacked-column3d', caption: 'Stacked Column Chart', image: 'stacked-column3d-chart/thumb.png',
          ctor: 'column3d', seriesType: 'column', referenceNames: ['x', 'value'],
          settings: {
            'chart.yScale().stackMode()': 'value'
          }
        },
        {
          type: 'percent-stacked-column3d', caption: 'Percent Stacked Column Chart', image: 'percent-stacked-column3d-chart/thumb.png',
          ctor: 'column3d', seriesType: 'column', referenceNames: ['x', 'value'],
          settings: {
            'chart.yScale().stackMode()': 'percent'
          }
        }
      ]
    },
    'bar': {
      category: 'bar', caption: 'Bar Charts', ctor: 'bar', isSeriesBased: true,
      list: [
        {type: 'bar', caption: 'Bar Chart', image: 'bar-chart/thumb.png', seriesType: 'bar', referenceNames: ['x', 'value']},
        {
          type: 'stacked-bar', caption: 'Stacked Bar Chart', image: 'stacked-bar-chart/thumb.png', seriesType: 'bar', referenceNames: ['x', 'value'],
          settings: {
            'chart.yScale().stackMode()': 'value'
          }
        },
        {
          type: 'percent-stacked-bar', caption: 'Percent Stacked Bar Chart', image: 'percent-stacked-bar-chart/thumb.png',
          seriesType: 'bar', referenceNames: ['x', 'value'],
          settings: {
            'chart.yScale().stackMode()': 'percent'
          }
        },
        {type: 'range-bar', caption: 'Range Bar Chart', image: 'range-bar-chart/thumb.png', seriesType: 'rangeBar', referenceNames: ['x', 'low', 'high']},

        // 3D
        {type: 'bar3d', caption: '3D Bar Chart', image: 'bar3d-chart/thumb.png', ctor: 'bar3d', seriesType: 'bar', referenceNames: ['x', 'value']},
        {
          type: 'stacked-bar3d', caption: 'Stacked 3D Bar Chart', image: 'stacked-bar3d-chart/thumb.png',
          ctor: 'bar3d', seriesType: 'bar', referenceNames: ['x', 'value'],
          settings: {
            'chart.yScale().stackMode()': 'value'
          }
        },
        {
          type: 'percent-stacked-bar3d', caption: 'Percent Stacked 3D Bar Chart', image: 'percent-stacked-bar3d-chart/thumb.png',
          ctor: 'bar3d', seriesType: 'bar', referenceNames: ['x', 'value'],
          settings: {
            'chart.yScale().stackMode()': 'percent'
          }
        }
      ]
    },
    'piedonut': {
      category: 'piedonut', caption: 'Pie/Donut Charts', ctor: 'pie', isSeriesBased: false,
      list: [
        {
          type: 'pie', caption: 'Pie Chart', image: 'pie-chart/thumb.png', referenceNames: ['value']
        },
        {
          type: 'donut', caption: 'Donut Chart', image: 'donut-chart/thumb.png', referenceNames: ['value'],
          settings: {
            'chart.innerRadius()': '50%'
          }
        },
        {
          type: 'pie3d', caption: '3D Pie Chart', image: 'pie3d-chart/thumb.png', ctor: 'pie3d', referenceNames: ['value']
        },
        {
          type: 'donut3d', caption: '3D Donut Chart', image: 'donut3d-chart/thumb.png', ctor: 'pie3d', referenceNames: ['value'],
          settings: {
            'chart.innerRadius()': '50%'
          }
        }
      ]
    },
    'funnelpyramid': {
      category: 'funnelpyramid', caption: 'Funnel/Pyramid Charts', isSeriesBased: false,
      list: [
        {
          type: 'funnel', caption: 'Funnel Chart', image: 'funnel-chart/thumb.png', ctor: 'funnel', referenceNames: ['value']
        },
        {
          type: 'pyramid', caption: 'Pyramid Chart', image: 'pyramid-chart/thumb.png', ctor: 'pyramid', referenceNames: ['value']
        }
      ]
    },
    'others': {
      category: 'others', caption: 'Others Charts', isSeriesBased: true,
      list: [
        {
          type: 'box', caption: 'Box Chart', image: 'box-chart/thumb.png',
          ctor: 'box', seriesType: 'box', referenceNames: ['lowest', 'q1', 'median', 'q3', 'highest']
        },
        {
          type: 'bubble', caption: 'Bubble Chart', image: 'cartesian-bubble-chart/thumb.png',
          ctor: 'line', seriesType: 'bubble', referenceNames: ['value', 'size'],
          settings: {
            'chart.defaultSeriesType()': 'bubble'
          }
        },
        {
          type: 'marker', caption: 'Marker Chart', image: 'cartesian-marker-chart/thumb.png',
          ctor: 'line', seriesType: 'marker', referenceNames: ['value'],
          settings: {
            'chart.defaultSeriesType()': 'marker'
          }
        },
        {
          type: 'candlestick', caption: 'Candlestick Chart', image: 'candlestick-chart/thumb.png',
          ctor: 'line', seriesType: 'candlestick', referenceNames: ['open', 'high', 'low', 'close'],
          settings: {
            'chart.defaultSeriesType()': 'candlestick'
          }
        },
        {
          type: 'ohlc', caption: 'OHLC Chart', image: 'ohlc-chart/thumb.png',
          ctor: 'line', seriesType: 'ohlc', referenceNames: ['open', 'high', 'low', 'close'],
          settings: {
            'chart.defaultSeriesType()': 'ohlc'
          }
        }
      ]
    }
  };
  this.sharedModel_.presetsList = goog.object.getValues(this.sharedModel_.presets);

  this.imagesLoaded_ = false;
  this.preloader_ = new anychart.ui.Preloader();
  var imageLoader = new goog.net.ImageLoader();
  this.registerDisposable(imageLoader);
  goog.events.listen(imageLoader, goog.net.EventType.COMPLETE, function() {
    this.imagesLoaded_ = true;
    this.preloader_.visible(false);
  }, false, this);

  goog.array.forEach(this.sharedModel_.presetsList, function(category) {
    goog.array.forEach(category.list, function(chart) {
      imageLoader.addImage(chart.type, 'https://cdn.anychart.com/images/chartopedia/' + chart.image);
    });
  });

  imageLoader.start();

  goog.events.listen(this, anychart.enums.EventType.COMPLETE, this.onComplete_, false, this);
};
goog.inherits(anychart.ui.Editor, anychart.ui.Component);


/** @inheritDoc */
anychart.ui.Editor.prototype.render = function(opt_parentElement) {
  anychart.ui.Editor.base(this, 'render', opt_parentElement);
  this.showPreloader_();
};


/** @inheritDoc */
anychart.ui.Editor.prototype.decorate = function(element) {
  anychart.ui.Editor.base(this, 'decorate', element);
  this.showPreloader_();
};


/**
 * Renders the Chart Editor as modal dialog.
 * @param {string=} opt_class CSS class name for the dialog element, also used
 *     as a class name prefix for related elements; defaults to modal-dialog.
 *     This should be a single, valid CSS class name.
 * @param {boolean=} opt_useIframeMask Work around windowed controls z-index
 *     issue by using an iframe instead of a div for bg element.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 */
anychart.ui.Editor.prototype.renderAsDialog = function(opt_class, opt_useIframeMask, opt_domHelper) {
  this.dialog_ = new anychart.ui.Editor.Dialog(opt_class, opt_useIframeMask, opt_domHelper);
  this.dialog_.addChild(this, true);
};


/**
 * Sets the visibility of the dialog box and moves focus to the
 * default button. Lazily renders the component if needed.
 * @param {boolean=} opt_value Whether the dialog should be visible.
 * @return {boolean|!anychart.ui.Editor}
 */
anychart.ui.Editor.prototype.visible = function(opt_value) {
  if (!this.dialog_) return true;

  if (goog.isDef(opt_value)) {
    this.dialog_.setVisible(opt_value);
    this.showPreloader_();
    return this;
  }

  return this.dialog_.isVisible();
};


/**
 * Check if images are not fully loaded and shows preloader if need.
 * @private
 */
anychart.ui.Editor.prototype.showPreloader_ = function() {
  if (!this.imagesLoaded_) {
    var element = this.getContentElement();
    this.preloader_.render(element);
    this.preloader_.visible(true);
  }
};


/**
 * Close dialog (if exists) on complete button press.
 * @private
 */
anychart.ui.Editor.prototype.onComplete_ = function() {
  if (this.dialog_)
    this.dialog_.setVisible(false);
};


/** @override */
anychart.ui.Editor.prototype.enterDocument = function() {
  anychart.ui.Editor.base(this, 'enterDocument');

  var element = this.getElement();
  goog.dom.classlist.add(element, goog.getCssName('anychart-chart-editor'));

  this.setCurrentStepIndex_(0, false);
  this.listen(anychart.ui.chartEditor.events.EventType.CHANGE_STEP, this.onChangeStep_);
};


/**
 *
 * @param {Object} e
 * @private
 */
anychart.ui.Editor.prototype.onChangeStep_ = function(e) {
  this.setCurrentStepIndex_(e.stepIndex, true);
  this.currentStep_.update();
};


/**
 * Remove step from DOM.
 * @param {anychart.ui.chartEditor.steps.Base} step
 * @private
 */
anychart.ui.Editor.prototype.removeStep_ = function(step) {
  // Remove the child component's DOM from the document.  We have to call
  // exitDocument first (see documentation).
  step.exitDocument();
  goog.dom.removeNode(step.getElement());
};


/**
 * @return {?anychart.ui.chartEditor.steps.Base} The currently step (null if none).
 * @private
 */
anychart.ui.Editor.prototype.getCurrentStep_ = function() {
  return this.currentStep_;
};


/**
 * Render the given step.
 * @param {anychart.ui.chartEditor.steps.Base} step
 * @param {boolean} doAnimation
 * @private
 */
anychart.ui.Editor.prototype.setCurrentStep_ = function(step, doAnimation) {
  if (!this.isInDocument()) return;
  if (!step || step.isInDocument()) {
    return;
  }

  if (this.currentStep_) {
    if (doAnimation) {
      var currentAnimation = new goog.fx.AnimationSerialQueue();
      currentAnimation.add(new goog.fx.dom.FadeOut(this.currentStep_.getElement(), 300));
      currentAnimation.play();
      goog.events.listenOnce(
          currentAnimation, goog.fx.Transition.EventType.END, goog.bind(this.removeStep_, this, this.currentStep_));
    } else {
      this.removeStep_(this.currentStep_);
    }
    this.currentStep_ = null;
    this.sharedModel_.currentStep = null;
    this.sharedModel_.currentStepIndex = NaN;
  }

  if (step) {
    this.currentStep_ = step;
    this.sharedModel_.currentStep = this.getCurrentStepDescriptor_();
    step.render(this.getContentElement());
    step.setParentEventTarget(this);
    this.sharedModel_.currentStep.isVisited = true;

    var stepAnimation = new goog.fx.AnimationSerialQueue();
    stepAnimation.add(new goog.fx.dom.FadeIn(step.getElement(), 300));
    stepAnimation.play();
  }
};


/**
 * @return {number} Index of the currently step (-1 if none).
 * @private
 */
anychart.ui.Editor.prototype.getCurrentStepIndex_ = function() {
  return this.indexOfChild(this.getCurrentStep_());
};


/**
 * Render the step at the given index.
 * @param {number} index Index of the step to render (-1 to render none).
 * @param {boolean} doAnimation
 * @private
 */
anychart.ui.Editor.prototype.setCurrentStepIndex_ = function(index, doAnimation) {
  this.setCurrentStep_(/** @type {anychart.ui.chartEditor.steps.Base} */ (this.getChildAt(index)), doAnimation);
};


/**
 * Check passed step is last step.
 * @param {anychart.ui.chartEditor.steps.Base} step
 * @return {boolean}
 * @private
 */
anychart.ui.Editor.prototype.isLastStep_ = function(step) {
  return Boolean(step && step == this.getChildAt(this.getChildCount() - 1));
};


/**
 * Check passed step is current step.
 * @param {anychart.ui.chartEditor.steps.Base} step
 * @return {boolean}
 * @private
 */
anychart.ui.Editor.prototype.isCurrentStep_ = function(step) {
  return Boolean(step && step == this.getCurrentStep_());
};


/**
 * Go to next step.
 * @private
 */
anychart.ui.Editor.prototype.nextStep_ = function() {
  this.setCurrentStepIndex_(this.getCurrentStepIndex_() + 1, true);
};


/**
 * Go to previous step.
 * @private
 */
anychart.ui.Editor.prototype.prevStep_ = function() {
  this.setCurrentStepIndex_(this.getCurrentStepIndex_() - 1, true);
};


/**
 * @return {anychart.ui.chartEditor.steps.Base.Descriptor}
 * @private
 */
anychart.ui.Editor.prototype.getCurrentStepDescriptor_ = function() {
  return this.sharedModel_.steps[this.indexOfChild(this.currentStep_)];
};


/**
 * Update step descriptors.
 * @private
 */
anychart.ui.Editor.prototype.updateStepsDescriptors_ = function() {
  /**
   * @type {Array.<anychart.ui.chartEditor.steps.Base.Descriptor>}
   */
  var view = [];
  this.forEachChild(function(step) {
    view.push(/** @type {anychart.ui.chartEditor.steps.Base.Descriptor} */({
      index: this.indexOfChild(step),
      name: step.getName(),
      isLastStep: this.isLastStep_(step),
      isVisited: false
    }));
  }, this);

  this.sharedModel_.steps = view;
};


/**
 * Set data.
 * @param {...Array} var_args Raw data set.
 */
anychart.ui.Editor.prototype.data = function(var_args) {
  if (!goog.isDef(window['anychart']['data'])) return;
  if (!arguments.length) return;
  this.resetSharedModel_();

  for (var i = 0; i < arguments.length; i++) {
    var dataSet = arguments[i];
    if (goog.isArrayLike(dataSet))
      dataSet = window['anychart']['data']['set'](dataSet);

    if (dataSet['mapAs']) {
      this.sharedModel_.dataSets.push({
        index: i,
        name: 'Data Set ' + (i + 1),
        instance: dataSet,
        rawMappings: [],
        mappings: []
      });
    }
  }

  this.setCurrentStepIndex_(0, goog.isObject(this.currentStep_));
  this.update();
};


/**
 * @private
 */
anychart.ui.Editor.prototype.resetSharedModel_ = function() {
  this.sharedModel_.dataSets.length = 0;
  this.sharedModel_.dataMappings.length = 0;
  this.sharedModel_.seriesMappings = {};
  this.sharedModel_.chartMapping = 0;
  this.sharedModel_.lastSeriesId = 0;

  this.sharedModel_.presetCategory = 'column';
  this.sharedModel_.presetType = 'column';
  this.sharedModel_.presetSettings.length = 0;

  if (this.sharedModel_.chart) this.sharedModel_.chart.dispose();
  this.sharedModel_.chart = null;
  this.sharedModel_.isSeriesBased = true;
  this.sharedModel_.chartContainer = null;
  this.sharedModel_.chartConstructor = 'column';
  this.sharedModel_.seriesType = 'column';

  this.updateModelInSteps_();
};


/**
 * Update shared model in all steps.
 * @private
 */
anychart.ui.Editor.prototype.updateModelInSteps_ = function() {
  this.forEachChild(function(step) {
    step.setSharedModel(this.sharedModel_);
  }, this);

  this.controller_.setModel(this.sharedModel_);
};


/**
 * Update current step.
 */
anychart.ui.Editor.prototype.update = function() {
  if (this.currentStep_) {
    this.currentStep_.update();
  }
};


/** @override */
anychart.ui.Editor.prototype.disposeInternal = function() {
  this.currentStep_ = null;
  this.controller_ = null;
  this.sharedModel_.dataSets.length = 0;
  this.sharedModel_ = null;
  anychart.ui.Editor.base(this, 'disposeInternal');
};


// region exporting editor result
/**
 * @return {string}
 */
anychart.ui.Editor.prototype.getResultCode = function() {
  return this.controller_.getBuildCode();
};


/**
 * Return chart configuration as XML string or XMLNode.
 * @param {boolean=} opt_asXmlNode Return XML as XMLNode.
 * @param {boolean=} opt_includeTheme If the current theme properties should be included into the result.
 * @return {string|Node} Chart configuration.
 */
anychart.ui.Editor.prototype.getResultXml = function(opt_asXmlNode, opt_includeTheme) {
  var result = null;
  if (this.sharedModel_ && this.sharedModel_.chart) {
    result = this.sharedModel_.chart['toXml'](opt_asXmlNode, opt_includeTheme);
  }
  return result;
};


/**
 * Return chart configuration as JSON object or string.
 * @param {boolean=} opt_stringify Return as JSON as string. Note: stringifying ignores this flag.
 * @param {boolean=} opt_includeTheme If the current theme properties should be included into the result.
 * @return {*} Chart JSON.
 */
anychart.ui.Editor.prototype.getResultJson = function(opt_stringify, opt_includeTheme) {
  var result = null;
  if (this.sharedModel_ && this.sharedModel_.chart) {
    result = this.sharedModel_.chart['toJson'](opt_stringify, opt_includeTheme);
  }
  return result;
};
// endregion



// region Editor.Dialog
/**
 * @constructor
 * @param {string=} opt_class CSS class name for the dialog element, also used
 *     as a class name prefix for related elements; defaults to modal-dialog.
 *     This should be a single, valid CSS class name.
 * @param {boolean=} opt_useIframeMask Work around windowed controls z-index
 *     issue by using an iframe instead of a div for bg element.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link
 *     goog.ui.Component} for semantics.
 * @extends {goog.ui.Dialog}
 */
anychart.ui.Editor.Dialog = function(opt_class, opt_useIframeMask, opt_domHelper) {
  anychart.ui.Editor.Dialog.base(this, 'constructor', opt_class || goog.getCssName('anychart-chart-editor-dialog'), opt_useIframeMask, opt_domHelper);

  /**
   * Element for the logo of the title bar.
   * @type {Element}
   * @private
   */
  this.titleLogoEl_ = null;

  this.setTitle('Chart Editor');
  this.setButtonSet(null);
};
goog.inherits(anychart.ui.Editor.Dialog, goog.ui.Dialog);


/** @override */
anychart.ui.Editor.Dialog.prototype.createDom = function() {
  anychart.ui.Editor.Dialog.base(this, 'createDom');
  this.initTitleElements_();
};


/** @override */
anychart.ui.Editor.Dialog.prototype.decorateInternal = function(element) {
  anychart.ui.Editor.Dialog.base(this, 'decorateInternal', element);
  this.initTitleElements_();
};


/** @private */
anychart.ui.Editor.Dialog.prototype.initTitleElements_ = function() {
  var dom = this.getDomHelper();

  var titleElement = this.getTitleElement();
  this.titleLogoEl_ = dom.createDom(
      goog.dom.TagName.A,
      {'class': goog.getCssName(this.getCssClass(), 'title-logo'), 'href': 'https://anychart.com', 'target': '_blank'});
  goog.dom.insertSiblingBefore(this.titleLogoEl_, goog.dom.getFirstElementChild(titleElement));

  this.setTitle('Chart Editor');

  var close = this.getTitleCloseElement();
  goog.dom.appendChild(close, goog.dom.createDom(goog.dom.TagName.I, ['ac', 'ac-remove']));
};


/** @override */
anychart.ui.Editor.Dialog.prototype.enterDocument = function() {
  anychart.ui.Editor.Dialog.base(this, 'enterDocument');
  var bgEl = this.getBackgroundElement();
  if (bgEl)
    this.getHandler().listen(bgEl, goog.events.EventType.CLICK, this.onBackgroundClick_);
};


/** @override */
anychart.ui.Editor.Dialog.prototype.disposeInternal = function() {
  this.titleLogoEl_ = null;
  anychart.ui.Editor.Dialog.base(this, 'disposeInternal');
};


/** @private */
anychart.ui.Editor.Dialog.prototype.onBackgroundClick_ = function() {
  this.setVisible(false);
};
// endregion


/**
 * Constructor function for Chart Editor.
 * @return {anychart.ui.Editor}
 */
anychart.ui.editor = function() {
  return new anychart.ui.Editor();
};

//exports
(function() {
  var proto = anychart.ui.Editor.prototype;
  goog.exportSymbol('anychart.ui.editor', anychart.ui.editor);
  proto['data'] = proto.data;
  proto['render'] = proto.render;
  proto['decorate'] = proto.decorate;
  proto['renderAsDialog'] = proto.renderAsDialog;
  proto['visible'] = proto.visible;
  proto['listen'] = proto.listen;
  proto['listenOnce'] = proto.listenOnce;
  proto['unlisten'] = proto.unlisten;
  proto['unlistenByKey'] = proto.unlistenByKey;
  proto['removeAllListeners'] = proto.removeAllListeners;
  proto['dispose'] = proto.dispose;
  proto['getResultJson'] = proto.getResultJson;
  proto['getResultXml'] = proto.getResultXml;
  proto['getResultCode'] = proto.getResultCode;
})();
