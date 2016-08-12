var dom = require('@nymag/dom'),
  SpaceSettings = require('./space-settings-controller');

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

  // Add the buttons necessary
  this.addBrowseSpaceButton();
}

/**
 * Alias prototype
 */
var proto = SpaceLogicController.prototype;

/**
 * Launch a filterable list using the BrowseSpace controller
 */
proto.browseSpace = function() {
  SpaceSettings(this.options, this.parent);
}

/**
 * Add the button to browse the space
 */
proto.addBrowseSpaceButton = function() {
  var parentButton = dom.find(this.el, '.selected-info-parent'),
    browseButton = dom.create(
      `<button type="button" class="browse-space-button">
        <svg width="18" height="11" viewBox="0 0 18 11" xmlns="http://www.w3.org/2000/svg"><path d="M12.8 4.267H0V6.4h12.8V4.267zM0 0v2.133h17.067V0H0zm0 10.667h8.533V8.533H0v2.134z" fill="#4A4A4A" fill-rule="evenodd"/></svg>
      </button>`
    );

  dom.insertAfter(parentButton, browseButton);
  browseButton.addEventListener('click', this.browseSpace.bind(this));
}

module.exports = function(el, options, parent) {
  return new SpaceLogicController(el, options, parent)
};
