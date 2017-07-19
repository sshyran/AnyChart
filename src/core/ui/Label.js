goog.provide('anychart.core.ui.Label');
goog.require('anychart.core.ui.LabelBase');



/**
 * Label element class.<br/>
 * Label can be a part of another element (such as chart, legend, axis, etc) or it can
 * be used independently.<br/>
 * Label has a background and a large number of positioning options:
 * <ul>
 *   <li>{@link anychart.core.ui.Label#anchor}</li>
 *   <li>{@link anychart.core.ui.Label#position}</li>
 *   <li>{@link anychart.core.ui.Label#offsetX} and {@link anychart.core.ui.Label#offsetY}</li>
 *   <li>{@link anychart.core.ui.Label#parentBounds}</li>
 * </ul>
 * @example <c>Creating an autonomous label.</c><t>simple-h100</t>
 * anychart.standalones.label()
 *     .text('My custom Label')
 *     .fontSize(27)
 *     .background(null)
 *     .container(stage)
 *     .draw();
 * @constructor
 * @extends {anychart.core.ui.LabelBase}
 */
anychart.core.ui.Label = function() {
  anychart.core.ui.Label.base(this, 'constructor');
};
goog.inherits(anychart.core.ui.Label, anychart.core.ui.LabelBase);


//exports
(function() {
  var proto = anychart.core.ui.Label.prototype;
  proto['background'] = proto.background;
  proto['padding'] = proto.padding;
})();
