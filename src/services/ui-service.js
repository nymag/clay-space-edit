import dom from '@nymag/dom';

/**
 * Grab a Space element from the DOM based
 * on a Logic URI
 *
 * @param  {String} uri
 * @return {Element}
 */
export function spaceElFromLogicUri(uri) {
  var logicEL = dom.find(`[data-uri="${uri}"]`);

  return logicEL.parentElement;
}

/**
 * Opens the Spaces UI
 *
 * @param  {Object} store
 * @param  {String} spaceRef
 * @return {Promise}
 */
export function openUI(store, spaceRef) {

  const spaceName = window.kiln.utils.references.getComponentName(spaceRef),
    modalOptions = {
      title: 'Edit Space',
      size: 'large',
      type: 'spaces-ui',
      data: {
        spaceRef,
        spaceName
      }
    };

  return store.dispatch('openModal', modalOptions);
}

/**
 * Opens pane with components available to add to a Space
 *
 * @param  {Object} store
 * @param  {String} spaceRef
 * @param  {Array} components
 * @return {Promise}
 */
export function openAddComponent(store, spaceRef, components) {
  const modalOptions = {
    title: 'Add Component to Space',
    size: 'large',
    type: 'add-to-space',
    data: {
      components,
      spaceRef
    }
  };

  return store.dispatch('openModal', modalOptions);
}
