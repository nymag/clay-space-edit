import dom from '@nymag/dom';

/**
 * [removeSpace description]
 * @param  {[type]} store    [description]
 * @param  {[type]} logicUri [description]
 * @return {[type]}          [description]
 */
export function removeSpace(store, logicUri) {
  const parent = dom.find(`[data-uri="${logicUri}"]`).parentElement;

  if (parent) {
    remove(store, parent.getAttribute('data-uri'));
  }
}

/**
 * NOT AN ACTION, COMMIT IT
 * @param  {[type]} store [description]
 * @param  {[type]} el    [description]
 * @return {[type]}       [description]
 */
export function remove(store, uri) {
  // const el = this.currentComponent.el;


  return store.dispatch('unselect').then(() => {
    store.commit('REMOVE_COMPONENT', { uri });
    store.commit('RENDER_COMPONENT', {});
  });
  // return store.dispatch('unfocus').then(() => store.dispatch('removeComponent', el));

}
