goog.provide('anychart.elements.Ticks');

goog.require('anychart.Base');
goog.require('anychart.utils');



/**
 * Класс определяющий тики на оси.<br/>
 * У тиков можно настроить положение, длинну и характеристики линий.
 * @constructor
 * @extends {anychart.Base}
 */
anychart.elements.Ticks = function() {
  goog.base(this);

  /**
   * Ticks length.
   * @type {number}
   * @private
   */
  this.length_;

  /**
   * Ticks stroke.
   * @type {acgraph.vector.Stroke|string}
   * @private
   */
  this.stroke_;

  /**
   * Ticks position.
   * @type {anychart.elements.Ticks.Position|string}
   * @private
   */
  this.position_;

  /**
   * Ticks enabled.
   * @type {boolean}
   * @private
   */
  this.enabled_;
  this.restoreDefaults();
};
goog.inherits(anychart.elements.Ticks, anychart.Base);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Ticks.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REDRAW |
    anychart.Signal.BOUNDS_CHANGED;


//----------------------------------------------------------------------------------------------------------------------
//
//  Enums.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Опредляет положение тиков на оси относительно Chart area.
 * @enum {string}
 */
anychart.elements.Ticks.Position = {
  /**
   * Внутри области чарта, вне зависимости от положения самой оси.
   */
  INSIDE: 'inside',
  /**
   * Снаружи области чарта, вне зависимости от положения самой оси.
   */
  OUTSIDE: 'outside'
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Properties.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for current ticks length.
 * @return {number} Length of ticks.
 *//**
 * Setter for ticks length.
 * @illustration <t>simple-h100</t>
 * stage.text(10,0, 'axis');
 * stage.text(10,40, 'tick');
 * stage.path()
 *     .moveTo(0, 15)
 *     .lineTo(stage.width(), 15)
 *     .stroke('5 black');
 * stage.path()
 *     .moveTo(stage.width()/5-stage.width()/10, 15)
 *     .lineTo(stage.width()/5-stage.width()/10, 55)
 *     .moveTo(2*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(2*stage.width()/5-stage.width()/10, 55)
 *     .moveTo(3*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(3*stage.width()/5-stage.width()/10, 55)
 *     .moveTo(4*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(4*stage.width()/5-stage.width()/10, 55)
 *     .moveTo(5*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(5*stage.width()/5-stage.width()/10, 55);
 * stage.path()
 *     .moveTo(stage.width()/5, 15)
 *     .lineTo(stage.width()/5, 55)
 *     .lineTo(stage.width()/5-5, 55)
 *     .lineTo(stage.width()/5+5, 55)
 *     .stroke('1 grey 1');
 * stage.triangleUp(stage.width()/5, 20, 3).stroke('1 grey 1');
 * stage.triangleDown(stage.width()/5, 50, 3).stroke('1 grey 1');
 * stage.text(stage.width()/5, 57, 'length');
 * @param {number=} opt_value Value to set.
 * @return {anychart.elements.Ticks} An instance of the {@link anychart.elements.Ticks} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value .
 * @return {(number|!anychart.elements.Ticks)} .
 */
anychart.elements.Ticks.prototype.length = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.length_ = opt_value;
    this.dispatchSignal(anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    return this;
  } else
    return this.length_;
};


/**
 * Возаращает текущий stroke.
 * @return {acgraph.vector.Stroke} Возвращает текущую настройку линии.
 *//**
 * Устанавливает настройки stroke одним параметром.<br/>
 * Допустимы следующие варианты:
 * <ul>
 *  <li>Строкой в формате '[thickness ]color[ opacity]':
 *    <ol>
 *      <li><b>'color'</b> - {@link http://www.w3schools.com/html/html_colors.asp}.</li>
 *      <li><b>'thickness color'</b> - like a css border, e.g. '3 red' or '3px red'</li>
 *      <li><b>'color opacity'</b> - as a fill string, e.g. '#fff 0.5'</li>
 *      <li><b>'thickness color opacity'</b> - as a complex string, e.g. '3px #00ff00 0.5'</li>
 *    </ol>
 *  </li>
 *  <li>Объект {@link acgraph.vector.Stroke}</li>
 *  <li>Массив ключей {@link acgraph.vector.GradientKey}</li>
 *  <li><b>null</b> - сбросит текущие настройки stroke.</li>
 * </ul>
 * <b>Note:</b> String parts order is significant and '3px red' is not the same as 'red 3px'.
 * @shortDescription Устанавливает настройки stroke.
 * @illustration <t>simple-h100</t>
 * stage.text(10,0, 'axis');
 * stage.text(10,40, 'tick');
 * stage.path()
 *     .moveTo(0, 15)
 *     .lineTo(stage.width(), 15)
 *     .stroke('5 black');
 * stage.path()
 *     .moveTo(stage.width()/5-stage.width()/10, 15)
 *     .lineTo(stage.width()/5-stage.width()/10, 55)
 *     .moveTo(2*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(2*stage.width()/5-stage.width()/10, 55)
 *     .moveTo(3*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(3*stage.width()/5-stage.width()/10, 55)
 *     .moveTo(4*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(4*stage.width()/5-stage.width()/10, 55)
 *     .moveTo(5*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(5*stage.width()/5-stage.width()/10, 55)
 *     .stroke('2 blue .7');
 * @example <t>listingOnly</t>
 *  ticks.stroke('2 blue .7');
 * @param {(acgraph.vector.Stroke)=} opt_value ['black'] Стиль заливки в формате '[thickness ]color[ opacity]'.
 * @return {anychart.elements.Ticks} An instance of the {@link anychart.elements.Ticks} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke)=} opt_value .
 * @return {(!anychart.elements.Ticks|acgraph.vector.Stroke)} .
 */
anychart.elements.Ticks.prototype.stroke = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.stroke_ = opt_value;
    this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    return this;
  } else
    return this.stroke_;
};


/**
 * Getter for current ticks position.
 * @return {(anychart.elements.Ticks.Position|string)} Current position.
 *//**
 * Setter for ticks position.<br/>
 * You can set ticks inside of chart area or outside it's position.
 * @illustration <t>simple</t>
 * stage.text(10,40, 'axis');
 * stage.text(10,2, 'tick');
 * stage.path()
 *     .moveTo(0, 55)
 *     .lineTo(stage.width(), 55)
 *     .stroke('5 black');
 * stage.path()
 *     .moveTo(stage.width()/5-stage.width()/10, 15)
 *     .lineTo(stage.width()/5-stage.width()/10, 90)
 *     .moveTo(2*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(2*stage.width()/5-stage.width()/10, 90)
 *     .moveTo(3*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(3*stage.width()/5-stage.width()/10, 90)
 *     .moveTo(4*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(4*stage.width()/5-stage.width()/10, 90)
 *     .moveTo(5*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(5*stage.width()/5-stage.width()/10, 90);
 * stage.text(stage.width()/5, 92, 'inside position');
 * stage.text(stage.width()/5, 2, 'outside position');
 * stage.text(3*stage.width()/5, 92, 'Chart Area');
 * stage.rect(0, 55, stage.width(), 95).fill('orange 0.1').stroke('0 0')
 * @param {(anychart.elements.Ticks.Position|string)=} opt_value [{@link anychart.elements.Ticks.Position}.OUTSIDE]
 *  Value to set.
 * @return {anychart.elements.Ticks} An instance of the {@link anychart.elements.Ticks} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(anychart.elements.Ticks.Position|string)=} opt_value .
 * @return {(anychart.elements.Ticks.Position|string|!anychart.elements.Ticks)} .
 */
anychart.elements.Ticks.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.position_ = opt_value.toLowerCase();
    this.dispatchSignal(anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    return this;
  } else
    return this.position_;
};


/**
 * Gets or Sets element enabled state.
 * @param {boolean=} opt_value Element enabled state value.
 * @return {anychart.elements.Ticks|boolean} Element enabled state.
 */
anychart.elements.Ticks.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.enabled_ != opt_value) {
      this.enabled_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.enabled_;
  }
};


/**
 * Restore labels default settings.
 */
anychart.elements.Ticks.prototype.restoreDefaults = function() {
  this.length_ = 5;
  this.position_ = anychart.elements.Ticks.Position.OUTSIDE;
  this.stroke_ = 'black';
  this.enabled_ = true;
  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/**
 * Ticks serialization.
 * @return {Object} Serialized axis data.
 */
anychart.elements.Ticks.prototype.serialize = function() {
  var data = {};
  data['length'] = this.length();
  data['position'] = this.position();
  data['stroke'] = anychart.color.serialize(/** @type{acgraph.vector.Stroke} */(this.stroke()));
  data['enabled'] = this.enabled();

  return data;
};


/** @inheritDoc */
anychart.elements.Ticks.prototype.deserialize = function(value) {
  this.suspendSignalsDispatching();

  this.length(value['length']);
  this.position(value['position']);
  this.stroke(value['stroke']);
  this.enabled(value['enabled']);

  this.resumeSignalsDispatching(true);

  return this;
};
