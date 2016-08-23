var dom = require('@nymag/dom'),
  _ = require('lodash'),
  tpl = window.kiln.services.tpl,
  SpaceSettings = require('./space-settings-controller'),
  utils = require('../services/utils'),
  spaceName = 'clay-space',
  createService = require('../services/create-service'),
  selectorService = require('../services/selector');

function SpaceController(el, parent) {
  if (!Object.keys(parent).length) {
    // Whenever a new space is first created, Kiln does not
    // have reference to its parent's schema/component list
    // information. Because of this we can't add new components
    // properly. To fix this, trigger a reload if this
    // is a brand new Space component.
    window.location.reload();
  }

  this.el = el;

  this.parent = parent;

  this.childrenLogics = dom.findAll(this.el, '.space-logic');

  this.el.setAttribute('data-components', utils.makeComponentListAttr(this.parent));

  this.spaceRef = this.el.getAttribute('data-uri');

  this.init();
}

var proto = SpaceController.prototype;


proto.init = function() {
  this.findFirstActive()
    .addButtons();
};

proto.setupNewSpace = function(newEl) {
  this.addButtons();
};

/**
 * Find the first logic component that's active
 */
proto.findFirstActive = function() {
  var activeChild = dom.find(this.el, '.space-logic-active');

  if (activeChild) {
    activeChild.classList.add('space-logic-editing');
  } else if (!activeChild && this.childrenLogics.length) {
    this.childrenLogics[this.childrenLogics.length - 1].classList.add('space-logic-active', 'space-logic-editing');
  }

  return this;
}

/**
 * Launch a filterable list using the BrowseSpace controller
 */
proto.browseSpace = function() {
  SpaceSettings(this.el, {
    add: this.onAddCallback.bind(this),
    remove: this.onRemoveCallback.bind(this)
  });
}

/**
 * [onAddCallback description]
 * @param  {[type]} newEl [description]
 * @return {[type]}       [description]
 */
proto.onAddCallback = function(newEl) {
  this.addBrowseButton(newEl)
    .updateLogicCount(newEl)
    .componentListButton(newEl);
}

/**
 * [componentListButton description]
 * @param  {[type]} el [description]
 * @return {[type]}    [description]
 */
proto.componentListButton = function(el) {
  var targetComponent,
    addComponentButton,
    options;

  if (!el) {
    return this;
  }
  targetComponent = dom.find(el, '[data-uri]');
  addComponentButton = dom.find(targetComponent, '.selected-add');
  dom.find(targetComponent, '.component-selector-bottom').classList.remove('kiln-hide');
  addComponentButton.classList.remove('kiln-hide');
  addComponentButton.setAttribute('data-components', el.parentElement.getAttribute('data-components'));
  options = { ref: el.parentElement.getAttribute('data-uri') };
  addComponentButton.addEventListener('click', selectorService.launchAddComponent.bind(null, el, options, this.parent));
}

/**
 * [onRemoveCallback description]
 * @param  {[type]} component [description]
 * @return {[type]}           [description]
 */
proto.onRemoveCallback = function(component) {
  this.updateLogicCount(component)
    .findFirstActive();
}

proto.addBrowseButton = function(logicComponent) {
  var embeddedComponent = dom.find(logicComponent, '[data-uri]'),
    embeddedComponentParentButton = dom.find(embeddedComponent, '.selected-actions'),
    browseSpaceButton = tpl.get('.browse-space');

  if (!embeddedComponent || !embeddedComponentParentButton) {
    return this;
  }

  // Insert the button
  dom.prependChild(embeddedComponentParentButton, browseSpaceButton);

  dom.find(embeddedComponent, '.space-browse').addEventListener('click', this.browseSpace.bind(this));

  return this;
}

/**
 * Add the button to browse the space
 */
proto.addButtons = function() {
  var allLogics = dom.findAll(this.el, '.space-logic');

  _.each(allLogics, this.addBrowseButton.bind(this));

  // Get count of logics
  // TODO: Count on each button
  this.findLogicCount();

  return this;
}

/**
 * Find the number of logic components within a space
 * and put that number in the browse space button
 */
proto.findLogicCount = function() {
  var logicCount = dom.findAll(this.el, '.space-logic').length,
    countElement = dom.findAll(this.el, '.logic-count');

  _.each(countElement, function(count) {
    count.innerHTML = logicCount;
  });

  return this;
};

/**
 * Update the component's logic count inside the
 * browse button. Triggered on addition/removal of
 * logic components
 *
 * @param  {element} component
 */
proto.updateLogicCount = function(component) {
  this.el = component ? dom.closest(component, '.clay-space') : this.el;

  this.findLogicCount()
    .findFirstActive();

  return this;
}

module.exports = function(el, parent) {
  return new SpaceController(el, parent)
};
