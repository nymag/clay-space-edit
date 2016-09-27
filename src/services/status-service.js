'use strict';

var dom = require('@nymag/dom'),
  _ = require('lodash'),
  ACTIVE = 'data-logic-active',
  EDITING = 'data-logic-editing',
  LOGIC = 'data-logic';

/**
 * Add the active data attribute
 *
 * @param {Element} el
 */
function setActive(el) {
  el.setAttribute(ACTIVE, '');
}

/**
 * Add the editing data attribute
 *
 * @param {Element} el
 */
function setEditing(el) {
  el.setAttribute(EDITING, '');
}

/**
 * Add the active and editing data attribute
 *
 * @param {Element} el
 */
function setActiveAndEditing(el) {
  setEditing(el);
  setActive(el);
}

/**
 * Remove the editing data attribute
 *
 * @param {Element} el
 */
function removeEditing(el) {
  el.removeAttribute(EDITING);
}

/**
 * Remove the active data attribute
 *
 * @param {Element} el
 */
function removeActive(el) {
  el.removeAttribute(ACTIVE);
}

/**
 * Remove the active and editing data attribute
 *
 * @param {Element} el
 */
function removeActiveAndEditing(el) {
  removeEditing(el);
  removeActive(el);
}

/**
 * Find the first element with the active
 * data attribute within an element
 *
 * @param {Element} el
 * @return {Element}
 */
function findActive(el) {
  return dom.find(el, `[${ACTIVE}]`);
}

/**
 * Test if a component has the active attribute
 *
 * @param {Element} el
 * @return {Boolean}
 */
function isActive(el) {
  return _.isString(el.getAttribute(ACTIVE));
}

/**
 * Test if a component has the editing attribute
 *
 * @param {Element} el
 * @return {Boolean}
 */
function isEditing(el) {
  return _.isString(el.getAttribute(EDITING));
}

/**
 * Test if a component has the logic attribute
 *
 * @param {Element} el
 * @return {Boolean}
 */
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
