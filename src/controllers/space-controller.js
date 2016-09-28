var dom = require('@nymag/dom'),
  _ = require('lodash'),
  utils = require('../services/utils'),
  selectorService = require('../services/selector'),
  saveService = require('../services/save-service'),
  statusService = require('../services/status-service'),
  proto = SpaceController.prototype;

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

  this.childrenLogics;

  this.el.setAttribute('data-components', utils.makeComponentListAttr(this.parent));

  this.spaceRef = this.el.getAttribute('data-uri');

  window.kiln.on('save', (component) => {
    var componentElement = dom.find(this.el, '[data-uri="' + component._ref + '"]'),
      isLogicElement,
      parentIsLogic;

    if (!componentElement) {
      return;
    }

    isLogicElement = statusService.isLogic(componentElement);
    parentIsLogic = statusService.isLogic(componentElement.parentElement);

    if (!isLogicElement && parentIsLogic) {
      saveService.onLogicWrappedSave.call(this, componentElement);
    } else if (isLogicElement && componentElement) {
      saveService.call(this, component, componentElement);
    }
  });


  this.init();
}

proto.init = function () {
  this.updateChildrenCount()
    .findFirstActive()
    .addButtons();
};

/**
 * Find the first logic component that's active
 * @returns {SpaceController}
 */
proto.findFirstActive = function () {
  var activeChild = statusService.findActive(this.el),
    lastActive = this.childrenLogics[this.childrenLogics.length - 1];

  if (activeChild) {
    statusService.setEditing(activeChild);
  } else if (!activeChild && this.childrenLogics.length) {
    statusService.setActiveAndEditing(lastActive);
  }

  return this;
};

/**
 * Called after a componet is added to a space
 * @param {Element} newEl [description]
 */
proto.onAddCallback = function (newEl) {
  selectorService.addBrowseButton.call(this, newEl);
  selectorService.addRemoveButton.call(this, newEl);
  this.updateChildrenCount()
    .updateLogicCount(newEl)
    .componentListButton(newEl);
};

/**
 * [updateChildrenCount description]
 * @returns {SpaceController}
 */
proto.updateChildrenCount = function () {
  this.childrenLogics = utils.findAllLogic(this.el);

  return this;
};

/**
 *
 * @param  {Element} el
 * @returns {SpaceController}
 */
proto.componentListButton = function (el) {
  var addComponentButton,
    options;

  if (el) {
    addComponentButton = selectorService.revealAddComponentButton(el);
    options = { ref: el.parentElement.getAttribute('data-uri') };
    addComponentButton.addEventListener('click', selectorService.launchAddComponent.bind(null, el, options, this.parent));
  }

  return this;
};

/**
 * @param  {Element} component
 */
proto.onRemoveCallback = function (component) {
  this.updateChildrenCount()
    .updateLogicCount(component)
    .findFirstActive();
};

/**
 * Add the button to browse the space
 * @returns {SpaceController}
 */
proto.addButtons = function () {
  _.each(this.childrenLogics, (logic) => {
    selectorService.addBrowseButton.call(this, logic);
    selectorService.addRemoveButton.call(this, logic);
  });

  // Get count of logics
  this.findLogicCount();

  return this;
};

/**
 * Find the number of logic components within a space
 * and put that number in the browse space button
 * @returns {SpaceController}
 */
proto.findLogicCount = function () {
  var logicCount = this.childrenLogics.length,
    countElement = dom.findAll(this.el, '.logic-count');

  _.each(countElement, function (count) {
    count.innerHTML = logicCount;
  });

  return this;
};

/**
 * Update the component's logic count inside the
 * browse button. Triggered on addition/removal of
 * logic components
 *
 * @param {Element} component
 * @returns {SpaceController}
 */
proto.updateLogicCount = function (component) {
  this.el = component ? dom.closest(component, '[data-space]') : this.el;

  this.findLogicCount()
    .findFirstActive();

  return this;
};

/**
 * Clear the editing classes
 * @return {SpaceController}
 */
proto.clearEditing = function () {
  _.each(this.childrenLogics, (logic) => {
    statusService.removeEditing(logic);
  });

  return this;
};

module.exports = function (el, parent) {
  return new SpaceController(el, parent);
};
