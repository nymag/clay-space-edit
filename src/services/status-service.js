'use strict';

var dom = require('@nymag/dom'),
  _ = require('lodash'),
  ACTIVE = 'space-logic-active',
  EDITING = 'space-logic-editing',
  LOGIC = 'data-logic';

function setActive(el) {
  el.setAttribute(ACTIVE, '');
}

function setEditing(el) {
  el.setAttribute(EDITING, '');
}

function setActiveAndEditing(el) {
  setEditing(el);
  setActive(el);
}

function removeEditing(el) {
  el.removeAttribute(EDITING);
}

function removeActive(el) {
  el.removeAttribute(ACTIVE);
}

function removeActiveAndEditing(el) {
  removeEditing(el);
  removeActive(el);
}

function findActive(el) {
  return dom.find(el, `[${ACTIVE}]`);
}

function isActive(el) {
  return _.isString(el.getAttribute(ACTIVE));
}

function isEditing(el) {
  return _.isString(el.getAttribute(EDITING));
}

function isLogic(el) {
  return _.isString(el.getAttribute(LOGIC));
}

module.exports.setActive = setActive;
module.exports.setEditing = setEditing;
module.exports.setActiveAndEditing = setActiveAndEditing;
module.exports.removeActive = removeActive;
module.exports.removeEditing = removeEditing;
module.exports.removeActiveAndEditing = removeActiveAndEditing;
module.exports.findActive = findActive;
module.exports.isActive = isActive;
module.exports.isEditing = isEditing;
module.exports.isLogic = isLogic;
