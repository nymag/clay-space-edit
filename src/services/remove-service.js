import dom from '@nymag/dom';
import { filter } from 'lodash';
import { getSpaceElFromLogic } from './utils';

/**
 * Given a Logic URI, remove the Space
 * in which it resides.
 *
 * @param  {Object} store
 * @param  {String} logicUri
 * @return {Promise}
 */
export function removeSpace(store, logicUri) {
  const logicEl = dom.find(`[data-uri="${logicUri}"]`),
    spaceEl = getSpaceElFromLogic(store.state.site.prefix, logicEl);

  return store.dispatch('removeComponent', spaceEl);
}

/**
 * Given a Space URI and a Logic URI, remove the
 * Logic URI from the Space.
 *
 * @param  {Object} store
 * @param  {String} spaceRef
 * @param  {String} logicUri
 * @return {Promise}
 */
export function remove(store, spaceRef, logicUri) {
  var spaceContent = store.state.components[spaceRef].content,
    filteredSpace = filter(spaceContent, (item) => {
      return item._ref !== logicUri;
    });

  return store.dispatch('saveComponent', { uri: spaceRef, data: { content: filteredSpace }});
}

/**
 * Given the URI for a Logic component, find the parent Space
 * and remove the Logic
 *
 * @param  {Object}  store
 * @param  {String}  logicUri
 * @param  {Number}  itemsLength
 * @return {Promise}
 */
export function removeLogic(store, logicUri, itemsLength) {
  const logicEl = dom.find(`[data-uri="${logicUri}"]`),
    spaceEl = getSpaceElFromLogic(store.state.site.prefix, logicEl);
  let removalPromise = remove(store, spaceEl.getAttribute('data-uri'), logicUri);

  if (itemsLength && itemsLength === 1) {
    removalPromise.then(removeSpace(store, logicUri));
  }

  return removalPromise;
}
