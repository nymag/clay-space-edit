var dom = require('@nymag/dom'),
  _ = require('lodash'),
  SpaceSettings = require('./space-settings-controller'),
  kilnServices = window.kiln.services,
  references = kilnServices.references,
  tpl = kilnServices.tpl,
  getAddableComponents = kilnServices.addComponentsHandler.getAddableComponents,
  spaceName = 'clay-space';

function makeComponentListAttr(parent) {
  var include = _.get(parent, 'list.include') || _.get(parent, 'prop.include'),
  exclude = _.get(parent, 'list.exclude') || _.get(parent, 'prop.exclude');

  return _.remove(getAddableComponents(include, exclude), function(component) {
    return component !== spaceName;
  });
}

function SpaceController(el, options, parent) {
  this.el = el;
  this.options = options;
  this.parent = parent;
  this.browseButton;
  this.childrenComponents = dom.findAll(this.el, '.space-logic');
  this.el.setAttribute('data-components', makeComponentListAttr(this.parent));

  this.init();
}

var proto = SpaceController.prototype;


proto.init = function() {
  this.findFirstActive()
    .addBrowseSpaceButton();
};

proto.findFirstActive = function() {
  var activeChild = dom.find(this.el, '.space-logic-active');

  if (activeChild) {
    activeChild.classList.add('space-logic-editing');
  } else if (!activeChild && this.childrenComponents.length) {
    this.childrenComponents[this.childrenComponents.length - 1].classList.add('space-logic-active', 'space-logic-editing');
  }

  return this;
}

/**
 * Launch a filterable list using the BrowseSpace controller
 */
proto.browseSpace = function() {
  SpaceSettings(this.el, {
    add: this.updateLogicCount.bind(this)
  });
}

/**
 * Add the button to browse the space
 */
proto.addBrowseSpaceButton = function() {
  var parentButton = dom.find(this.el, '.selected-info-parent'),
    browseSpaceButton = tpl.get('.browse-space');

  // Insert the button
  dom.insertAfter(parentButton, browseSpaceButton);

  this.browseButton = dom.find(this.el, '.space-browse');
  this.browseButton.addEventListener('click', this.browseSpace.bind(this));
  this.findLogicCount();

  return this;
}

proto.findLogicCount = function() {
  var logicCount = dom.findAll(this.el, '.space-logic').length,
    countElement = dom.find(this.browseButton, '.logic-count');

  countElement.innerHTML = logicCount;
};

proto.updateLogicCount = function(component) {
  this.el = component ? dom.closest(component, '.clay-space') : this.el;

  this.findLogicCount();
}

module.exports = function(el, options, parent) { return new SpaceController(el, options, parent)};
