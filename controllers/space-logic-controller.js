var dom = require('@nymag/dom'),
  tpl = window.kiln.services.tpl;

/**
 * [SpaceLogicController description]
 * @param {Element} el      The Space Logic component
 * @param {Object} options Options for the Space Logic
 * @param {Object} parent  Parent element and data (Clay Space)
 */
function SpaceLogicController(el, options, parent) {
  /**
   * @type {Element}
   */
  this.el = el;

  /**
   * @type {Object}
   */
  this.options = options;

  /**
   * @type {Object}
   */
  this.parent = parent;

  this.swapSelectParentButton();
}

/**
 * Alias prototype
 */
var proto = SpaceLogicController.prototype;

proto.swapSelectParentButton = function() {

}

module.exports = function(el, options, parent) {
  return new SpaceLogicController(el, options, parent)
};
