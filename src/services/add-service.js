import dom from '@nymag/dom';
import { getAvailableComponents, findSpaceParentUriAndList } from './utils';
import { findSpaceLogic } from './create-service';

export function findAvailableComponents(store, spaceRef) {
  const parent = findSpaceParentUriAndList(spaceRef);

  return getAvailableComponents(store, parent.el, parent.list);
}

export function addToSpace(store, spaceRef, componentName) {
  var parent =  findSpaceParentUriAndList(spaceRef),
    logic = findSpaceLogic(store, window.kiln.utils.references.getComponentName(spaceRef)),
    lastSpaceLogic = _.last(store.state.components[spaceRef].content)._ref,
    _components = [{name: logic}],
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
    });

  });
}
