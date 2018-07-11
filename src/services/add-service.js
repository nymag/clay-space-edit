import { getAvailableComponents, findParentUriAndList } from './utils';
import { findSpaceLogic } from './create-service';
import { setNewActive } from '../services/toggle-service';
import { last } from 'lodash';

export function findAvailableComponents(store, spaceRef) {
  const parent = findParentUriAndList(spaceRef);

  return getAvailableComponents(store, parent.el, parent.list);
}

export function addToSpace(store, spaceRef, componentName) {
  var logic = findSpaceLogic(store, window.kiln.utils.references.getComponentName(spaceRef)),
    lastSpaceLogic = last(store.state.components[spaceRef].content)._ref,
    embeddedComponent = window.kiln.utils.create.default([{name:componentName}]);

  return embeddedComponent.then(function (res) {
    var embeddedComponent = last(res),
      newSpaceLogicData = {
        embeddedComponent: embeddedComponent
      };

    return store.dispatch('addComponents', {
      parentURI: spaceRef,
      currentURI: lastSpaceLogic,
      path: 'content',
      replace: false,
      components: [
        {
          name: logic,
          data: newSpaceLogicData
        }
      ]
    })
      .then(() => setNewActive(store, spaceRef));
  });
}
