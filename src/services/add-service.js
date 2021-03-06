import { getAvailableComponents, findParentUriAndList } from './utils';
import { findSpaceLogic } from './create-service';
import { setNewActiveLogic } from '../services/toggle-service';
import _ from 'lodash';

export function findAvailableComponents(store, spaceRef) {
  const parent = findParentUriAndList(spaceRef);

  return getAvailableComponents(store, parent.el, parent.list);
}

export function addToSpace(store, spaceRef, componentName) {
  var logic = findSpaceLogic(store, window.kiln.utils.references.getComponentName(spaceRef)),
    lastSpaceLogic = _.last(store.state.components[spaceRef].content)._ref,
    embeddedComponent = window.kiln.utils.create.default([{name:componentName}]);

  return embeddedComponent.then(function (res) {
    var embeddedComponent = _.last(res),
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
      .then(() => setNewActiveLogic(store, spaceRef));
  });
}
