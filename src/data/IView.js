goog.provide('anychart.data.IView');



/**
 * A common part between anychart.data.Set and anychart.data.View.
 * @interface
 */
anychart.data.IView = function() {
};


/**
 * Gets or sets the full row of the set by its index. If there is no any row for the index - returns undefined.
 * If used as a setter - returns the previous value of the row (don't think it saves the previous state of objects
 * stored by reference - it doesn't).
 *
 * NOTE: The number of parameters is the only thing that matters in determining if it is a setter or a getter!
 *
 * @param {number} rowIndex Index of the row to fetch.
 * @param {*=} opt_value If passed, the method is treated as a setter.
 * @return {*} The full row current or previous value. May be anything including undefined.
 */
anychart.data.IView.prototype.row = function(rowIndex, opt_value) {};


/**
 * Returns the size of the data set (number of rows).
 * @return {number} Number of rows in the set.
 */
anychart.data.IView.prototype.getRowsCount = function() {};
