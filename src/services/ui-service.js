import dom from '@nymag/dom';

const getComponentName = window.kiln.utils.references.getComponentName;

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
  const spaceName = getComponentName(spaceRef),
    paneOptions = {
      position: 'center',
      size: 'large',
      content: {
        component: 'spaces-ui',
        spaceRef,
        spaceName
      },
      name: 'spaces-ui',
      title: store.state.schemas[spaceName]._title
    };

  return store.dispatch('openPane', paneOptions);
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
  const spaceName = getComponentName(spaceRef),
    paneOptions = {
      position: 'center',
      size: 'medium',
      content: {
        component: 'add-to-space',
        components,
        spaceRef
      },
      name: 'add-to-space',
      title: 'Add Component To Space'
    };

  return store.dispatch('openPane', paneOptions);
}
