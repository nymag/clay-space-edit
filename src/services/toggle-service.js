import dom from '@nymag/dom';
import { forEach, get } from 'lodash';

const activeAttr = 'data-logic-active';

/**
 * Find every Space, iterate through them, set
 * the first active.
 *
 * @param  {Object} store
 */
export function initSpaces(store) {
  var allSpaces = Array.from(dom.findAll('[data-uri*="components/clay-space"]')),
    activeUri;

  forEach(allSpaces, function (space) {
    if (!space.classList.contains('clay-space-edit')) {
      activeUri = getActive(store, space.getAttribute('data-uri'), space);
      dom.find(`[data-uri="${activeUri}"]`).setAttribute(activeAttr, '');
    }
  });
}

/**
 * Get the active Logic or assign the first one to be "active"
 *
 * @param  {Object} store
 * @param  {String} spaceRef
 * @param  {Element} spaceEl
 * @return {String}
 */
export function getActive({ state: { components } }, spaceRef, spaceEl) {
  var $spaceEl = spaceEl ? spaceEl : dom.find(`[data-uri="${spaceRef}"]`),
    $firstActive = Array.from(dom.findAll($spaceEl, `[${activeAttr}]`)),
    activeUri;

  // account for Logic components that don't have properties set, and will always
  // have displaySelf: true
  if ($firstActive.length > 0) {
    activeUri = $firstActive.shift().getAttribute('data-uri');
    forEach($firstActive, removeAttr);
  } else {
    activeUri = get(components, `${spaceRef}.content[0]._ref`);
  }

  return activeUri;
}

/**
 * Remove the active attribute
 *
 * @param  {String} $el
 */
export function removeAttr($el) {
  $el.removeAttribute(activeAttr);
}

/**
 * Set the active attribute and make sure each Space only has one active Logic
 *
 * @param {string} spaceRef
 * @param {string} logicRef
 */
export function setAttr(spaceRef, logicRef) {
  // make sure there are no other active Logics with in the space
  const currentActive = document.querySelector(`[data-uri="${spaceRef}"] > [${activeAttr}]`),
    targetLogic = dom.find(`[data-uri="${logicRef}"]`);

  if (currentActive) {
    removeAttr(currentActive);
  }

  targetLogic.setAttribute(activeAttr, '');
}

/**
 * Set new active logic.
 * For cases when the components are re-rendered after a dispatched event. The
 * '.active' class is set manually and is not tied to any data. This class
 * disappears after a Vue render and needs to be set manually again.
 *
 * @param {Object} store
 * @param {string} spaceRef
 */
export function setNewActive(store, spaceRef) {
  const newActiveLogic = getActive(store, spaceRef);

  setAttr(spaceRef, newActiveLogic);
}

/**
 * Turn all components to inactive and then set the
 * target to active
 *
 * @param  {String} currentActive
 * @param  {String} targetLogic
 * @return {String}
 */
export function toggle(currentActive, targetLogic) {
  var currentActive = dom.find(`[data-uri="${currentActive}"]`);

  // toggle attr in DOM
  removeAttr(currentActive);
  setAttr(targetLogic);

  return targetLogic;
}
