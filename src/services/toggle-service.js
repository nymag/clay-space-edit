import dom from '@nymag/dom';
import _ from 'lodash';

const activeAttr = 'data-logic-active';

/**
 * Find every Space and exclude the clay-space-edit component.
 * Exporting it so we can mock for tests.
 *
 * @return {Array}
 *
 */
export function findAllSpaces() {
  let allSpaces = Array.from(dom.findAll('[data-uri*="components/clay-space"]'));

  return allSpaces.filter((space)=>{
    return !space.classList.contains('clay-space-edit');
  });
}

/**
 * Find every Space, iterate through them, set the first active.
 *
 * @param  {Object} store
 */
export function initSpaces(store) {
  const allSpaces = findAllSpaces();
  let activeUri;

  _.forEach(allSpaces, function (space) {
    // get active logic and set the attribute so it is displayed
    activeUri = getActive(store, space.getAttribute('data-uri'));
    if (activeUri) {
      dom.find(`[data-uri="${activeUri}"]`).setAttribute(activeAttr, '');
    }
  });
}

/**
 * Get the active Logic or assign the first one to be "active"
 *
 * @param  {Object} store
 * @param  {String} spaceRef
 * @return {String}
 */
export function getActive({ state: { components } }, spaceRef) {
  const $spaceEl = dom.find(`[data-uri="${spaceRef}"]`),
    $activeLogics = Array.from(dom.findAll($spaceEl, `[${activeAttr}]`));
  let activeUri;

  if ($activeLogics.length > 0) {
    // if there is more than Logic that has its conditions for display are
    // satisfied, only the first Logic should be displayed
    activeUri = $activeLogics.shift().getAttribute('data-uri');

    // ...the other active Logics should be hidden
    _.forEach($activeLogics, removeAttr);
  } else {
    // if there are no Logics active, set the first Logic in the Space to be
    // active
    activeUri = _.get(components[spaceRef], 'content[0]._ref');
  }

  if (!activeUri) {
    console.warn(`clay-space ${spaceRef} is empty! This component should have been removed.`);
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
  const currentActive = dom.find(`[data-uri="${spaceRef}"] > [${activeAttr}]`),
    targetLogic = dom.find(`[data-uri="${logicRef}"]`);

  if (currentActive) {
    removeAttr(currentActive);
  }

  targetLogic.setAttribute(activeAttr, '');
}

/**
 * Set new active logic.
 * For cases when the components are re-rendered after a dispatched event. The
 * 'data-logic-active' attribute is set manually and is not tied to any data.
 * This class disappears after a Vue render and needs to be set manually again.
 *
 * @param {Object} store
 * @param {string} spaceRef
 */
export function setNewActiveLogic(store, spaceRef) {
  const newActiveLogic = getActive(store, spaceRef);

  setAttr(spaceRef, newActiveLogic);
}
