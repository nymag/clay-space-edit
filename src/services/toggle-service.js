import dom from '@nymag/dom';
import { filter, forEach } from 'lodash';

const activeAttr = 'data-logic-active';

/**
 * Find every Space, iterate through them, set
 * the first active.
 *
 * @param  {Object} store
 */
export function initSpaces(store) {
  var possibleSpaces = Array.from(dom.findAll('[data-uri*="clay-space"]')),
    allSpaces,
    activeUri;

  console.log('Possible spaces on page:', possibleSpaces);

  allSpaces = filter(possibleSpaces, function (el) {
    // if the element is the HTML element or is the clay-space-edit component
    // then it is not a valid clay-space-component
    return el.tagName !== 'HTML' && !el.classList.contains('clay-space-edit');
  });

  console.log('All Spaces:', allSpaces);

  forEach(allSpaces, function (space) {
    activeUri = getActive(store, space.getAttribute('data-uri'), space);
    setAttr(dom.find(`[data-uri="${activeUri}"]`));
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

  if ($firstActive.length > 1) {
    activeUri = $firstActive.shift().getAttribute('data-uri');
    forEach($firstActive, removeAttr);
  } else {
    console.log('Setting active spaceRef:',spaceRef);
    console.log('Component data for spaceRef:', components[spaceRef]);
    activeUri = components[spaceRef].content[0]._ref;
  }

  return activeUri;
}

/**
 * Remove the active attribute
 *
 * @param  {Element} $el
 */
function removeAttr($el) {
  $el.removeAttribute(activeAttr);
}

/**
 * Set the active attribute
 *
 * @param {Element} $el
 */
export function setAttr($el) {
  $el.setAttribute(activeAttr, '');
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
  var currentActive = dom.find(`[data-uri="${currentActive}"]`),
    targetActive = dom.find(`[data-uri="${targetLogic}"]`);

  // toggle attr in DOM
  removeAttr(currentActive);
  setAttr(targetActive);

  return targetLogic;
}
