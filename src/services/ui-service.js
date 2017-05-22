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
