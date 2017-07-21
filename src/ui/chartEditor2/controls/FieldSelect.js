goog.provide('anychart.ui.chartEditor2.controls.FieldSelect');

goog.require('goog.ui.Component');
goog.require('anychart.ui.chartEditor2.controls.Select');


/**
 * @param name {String}
 * @param opt_domHelper
 * @constructor
 * @extends {goog.ui.Container}
 */
anychart.ui.chartEditor2.controls.FieldSelect = function(name, opt_domHelper) {
  anychart.ui.chartEditor2.controls.FieldSelect.base(this, 'constructor', opt_domHelper);

  this.name_ = name;
};
goog.inherits(anychart.ui.chartEditor2.controls.FieldSelect, goog.ui.Component);



anychart.ui.chartEditor2.controls.FieldSelect.prototype.createDom = function() {
  goog.base(this, 'createDom');

  var dom = this.getDomHelper();
  var element = this.getElement();

  goog.dom.classlist.add(this.getElement(), 'field-select');

  element.appendChild(dom.createDom(goog.dom.TagName.LABEL, 'label', this.name_));

  this.select_ = new anychart.ui.chartEditor2.controls.Select();
  this.addChild(this.select_, true);
};


anychart.ui.chartEditor2.controls.FieldSelect.prototype.getItemCount = function() {
  return this.select_.getItemCount();
};


anychart.ui.chartEditor2.controls.FieldSelect.prototype.removeItemAt = function(index) {
  return this.select_.removeItemAt(index);
};


/**
 * @param item {goog.ui.MenuItem|anychart.ui.chartEditor2.controls.MenuItemWithTwoValues}
 */
anychart.ui.chartEditor2.controls.FieldSelect.prototype.addItem = function(item) {
  return this.select_.addItem(item);
};


anychart.ui.chartEditor2.controls.FieldSelect.prototype.setSelectedIndex = function(index) {
  return this.select_.setSelectedIndex(index);
};


anychart.ui.chartEditor2.controls.FieldSelect.prototype.getValue = function() {
  return this.select_.getValue();
};


anychart.ui.chartEditor2.controls.FieldSelect.prototype.getValue2 = function() {
  var selectedItem = this.select_.getSelectedItem();
  return selectedItem ? selectedItem.getValue2() : null;
};
