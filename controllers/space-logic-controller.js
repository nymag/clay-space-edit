var dom = require('@nymag/dom'),
  SpaceSettings = require('./space-settings-controller'),
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

  // Add the buttons necessary
  this.addBrowseSpaceButton()
    .removeDefaultButtons();
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
    browseSpaceButton = tpl.get('.browse-space'),
    browseButton;

  // Insert the button
  dom.insertAfter(parentButton, browseSpaceButton);

  browseButton = dom.find(this.el, '.space-browse');
  browseButton.addEventListener('click', this.browseSpace.bind(this));

  return this;
}

proto.removeDefaultButtons = function() {
  var settingsButton = dom.find(this.el, '.selected-action-settings');
  settingsButton.classList.add('kiln-hide');
}

module.exports = function(el, options, parent) {
  return new SpaceLogicController(el, options, parent)
};
