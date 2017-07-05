goog.provide('anychart.core.annotations');

goog.require('anychart.core.settings');
goog.require('anychart.enums');


/**
 * Annotation property descriptor.
 * @typedef {{
 *    handler: number,
 *    propName: string,
 *    normalizer: Function,
 *    consistency: (anychart.ConsistencyState|number),
 *    signal: number
 * }}
 */
anychart.core.annotations.PropertyDescriptor;


/**
 * A set of possible anchor dependencies:
 *    1st bit is for the first X,
 *    2nd bit is for the first Y,
 *    3rd bit is for the second point,
 *    4th bit is for the third point
 * @enum {number}
 */
anychart.core.annotations.AnchorSupport = {
  NONE: 0, // for base
  X: 1,
  VALUE: 2,
  SECOND_POINT: 4,
  THIRD_POINT: 8,
  ONE_POINT: 3,
  TWO_POINTS: 7,
  THREE_POINTS: 15
};


/**
 * Annotation constructors by type.
 * @type {Object.<anychart.enums.AnnotationTypes, Function>}
 */
anychart.core.annotations.AnnotationTypes = {};


/**
 * @typedef {{
 *    color: acgraph.vector.AnyColor,
 *    allowEdit: boolean,
 *    hoverGap: number,
 *    xAnchor: number,
 *    valueAnchor: number,
 *    secondXAnchor: number,
 *    secondValueAnchor: number,
 *    thirdXAnchor: number,
 *    thirdValueAnchor: number,
 *    stroke: (acgraph.vector.Stroke|Function),
 *    hoverStroke: (acgraph.vector.Stroke|Function),
 *    selectStroke: (acgraph.vector.Stroke|Function),
 *    trend: (acgraph.vector.Stroke|Function),
 *    hoverTrend: (acgraph.vector.Stroke|Function),
 *    selectTrend: (acgraph.vector.Stroke|Function),
 *    grid: (acgraph.vector.Stroke|Function),
 *    hoverGrid: (acgraph.vector.Stroke|Function),
 *    selectGrid: (acgraph.vector.Stroke|Function),
 *    fill: (acgraph.vector.Fill|Function),
 *    hoverFill: (acgraph.vector.Fill|Function),
 *    selectFill: (acgraph.vector.Fill|Function),
 *    hatchFill: (acgraph.vector.PatternFill|Function),
 *    hoverHatchFill: (acgraph.vector.PatternFill|Function),
 *    selectHatchFill: (acgraph.vector.PatternFill|Function),
 *    markerType: anychart.enums.MarkerType,
 *    anchor: anychart.enums.Anchor,
 *    offsetX: number,
 *    offsetY: number,
 *    size: number,
 *    hoverSize: number,
 *    selectSize: number
 * }}
 */
anychart.core.annotations.AnnotationJSONFormat;


//region Property sets for different annotation types
//----------------------------------------------------------------------------------------------------------------------
//
//  Property sets for different annotation types
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Properties that should be defined in annotation.Base prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.annotations.BASE_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'color',
      anychart.core.settings.colorNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'allowEdit',
      anychart.core.settings.booleanNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'hoverGap',
      anychart.core.settings.naturalNumberNormalizer);

  return map;
})();


/**
 * Properties meta.
 * @type {!Array.<Array>}
 */
anychart.core.annotations.BASE_DESCRIPTORS_META = (function() {
  return [
    ['color', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['allowEdit', anychart.ConsistencyState.ANNOTATIONS_INTERACTIVITY, anychart.Signal.NEEDS_REDRAW],
    ['hoverGap', anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW]
  ];
})();


/**
 * Properties that should be defined in annotation prototype to support first X anchor.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.annotations.X_ANCHOR_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'xAnchor',
      anychart.core.settings.asIsNormalizer);
  return map;
})();


/**
 * Properties meta.
 * @type {!Array.<Array>}
 */
anychart.core.annotations.X_ANCHOR_DESCRIPTORS_META = (function() {
  return [
    ['xAnchor', anychart.ConsistencyState.ANNOTATIONS_ANCHORS, anychart.Signal.NEEDS_REDRAW]
  ];
})();


/**
 * Properties that should be defined in annotation prototype to support first Value anchor.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.annotations.VALUE_ANCHOR_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'valueAnchor',
      anychart.core.settings.asIsNormalizer);
  return map;
})();


/**
 * Properties meta.
 * @type {!Array.<Array>}
 */
anychart.core.annotations.VALUE_ANCHOR_DESCRIPTORS_META = (function() {
  return [
    ['valueAnchor', anychart.ConsistencyState.ANNOTATIONS_ANCHORS, anychart.Signal.NEEDS_REDRAW]
  ];
})();


/**
 * Properties that should be defined in annotation prototype to support second anchor point.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.annotations.SECOND_ANCHOR_POINT_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'secondXAnchor',
      anychart.core.settings.asIsNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'secondValueAnchor',
      anychart.core.settings.asIsNormalizer);
  return map;
})();


/**
 * Properties meta.
 * @type {!Array.<Array>}
 */
anychart.core.annotations.SECOND_ANCHOR_POINT_DESCRIPTORS_META = (function() {
  return [
    ['secondXAnchor', anychart.ConsistencyState.ANNOTATIONS_ANCHORS, anychart.Signal.NEEDS_REDRAW],
    ['secondValueAnchor', anychart.ConsistencyState.ANNOTATIONS_ANCHORS, anychart.Signal.NEEDS_REDRAW]
  ];
})();


/**
 * Properties that should be defined in annotation prototype to support third anchor point.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.annotations.THIRD_ANCHOR_POINT_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'thirdXAnchor',
      anychart.core.settings.asIsNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'thirdValueAnchor',
      anychart.core.settings.asIsNormalizer);

  return map;
})();


/**
 * Properties meta.
 * @type {!Array.<Array>}
 */
anychart.core.annotations.THIRD_ANCHOR_POINT_DESCRIPTORS_META = (function() {
  return [
    ['thirdXAnchor', anychart.ConsistencyState.ANNOTATIONS_ANCHORS, anychart.Signal.NEEDS_REDRAW],
    ['thirdValueAnchor', anychart.ConsistencyState.ANNOTATIONS_ANCHORS, anychart.Signal.NEEDS_REDRAW]
  ];
})();


/**
 * Properties that should be defined in annotation prototype to support stroke.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.annotations.STROKE_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'stroke',
      anychart.core.settings.strokeOrFunctionNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverStroke',
      anychart.core.settings.strokeOrFunctionNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectStroke',
      anychart.core.settings.strokeOrFunctionNormalizer);

  return map;
})();


/**
 * Properties meta.
 * @type {!Array.<Array>}
 */
anychart.core.annotations.STROKE_DESCRIPTORS_META = (function() {
  return [
    ['stroke', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW],
    ['hoverStroke', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW],
    ['selectStroke', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW]
  ];
})();


/**
 * Properties that should be defined in annotation prototype to support trend stroke.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.annotations.TREND_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'trend',
      anychart.core.settings.strokeOrFunctionNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverTrend',
      anychart.core.settings.strokeOrFunctionNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectTrend',
      anychart.core.settings.strokeOrFunctionNormalizer);

  return map;
})();


/**
 * Properties meta.
 * @type {!Array.<Array>}
 */
anychart.core.annotations.TREND_DESCRIPTORS_META = (function() {
  return [
    ['trend', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['hoverTrend', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['selectTrend', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW]
  ];
})();


/**
 * Properties that should be defined in annotation prototype to support grid strokes.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.annotations.GRID_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'grid',
      anychart.core.settings.strokeOrFunctionNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverGrid',
      anychart.core.settings.strokeOrFunctionNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectGrid',
      anychart.core.settings.strokeOrFunctionNormalizer);

  return map;
})();


/**
 * Properties meta.
 * @type {!Array.<Array>}
 */
anychart.core.annotations.GRID_DESCRIPTORS_META = (function() {
  return [
    ['grid', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['hoverGrid', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['selectGrid', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW]
  ];
})();


/**
 * Properties that should be defined in annotation prototype to support fill.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.annotations.FILL_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'fill',
      anychart.core.settings.fillOrFunctionNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverFill',
      anychart.core.settings.fillOrFunctionNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectFill',
      anychart.core.settings.fillOrFunctionNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hatchFill',
      anychart.core.settings.hatchFillOrFunctionNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverHatchFill',
      anychart.core.settings.hatchFillOrFunctionNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectHatchFill',
      anychart.core.settings.hatchFillOrFunctionNormalizer);

  return map;
})();


/**
 * Properties meta.
 * @type {!Array.<Array>}
 */
anychart.core.annotations.FILL_DESCRIPTORS_META = (function() {
  return [
    ['fill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['hoverFill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['selectFill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['hatchFill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['hoverHatchFill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['selectHatchFill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW]
  ];
})();


/**
 * Properties that should be defined in annotation prototype to support marker annotation settings.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.annotations.MARKER_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'markerType',
      anychart.enums.normalizeMarkerType);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'anchor',
      anychart.enums.normalizeAnchor);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'offsetX',
      anychart.core.settings.numberNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'offsetY',
      anychart.core.settings.numberNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'size',
      anychart.core.settings.numberNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'hoverSize',
      anychart.core.settings.numberNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'selectSize',
      anychart.core.settings.numberNormalizer);

  return map;
})();


/**
 * Properties meta.
 * @type {!Array.<Array>}
 */
anychart.core.annotations.MARKER_DESCRIPTORS_META = (function() {
  return [
    ['markerType', anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW],
    ['anchor', anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW],
    ['offsetX', anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW],
    ['offsetY', anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW],
    ['size', anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW],
    ['hoverSize', anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW],
    ['selectSize', anychart.ConsistencyState.ANNOTATIONS_SHAPES, anychart.Signal.NEEDS_REDRAW]
  ];
})();
//endregion
