import dom from '@nymag/dom';
import { getAvailableComponents, findSpaceParentUriAndList } from './utils';
import { findSpaceLogic } from './create-service';
import { getComponentName, createComponent } from './references';

export function findAvailableComponents(store, spaceRef) {
  const parent = findSpaceParentUriAndList(spaceRef);

  return getAvailableComponents(store, parent.el, parent.list);
}

export function addToSpace(store, spaceRef, componentName) {
  var parent =  findSpaceParentUriAndList(spaceRef),
    logic = findSpaceLogic(store, getComponentName(spaceRef)),
    lastSpaceLogic = _.last(store.state.components[spaceRef].content)._ref,
    _components = [{name: logic}],
    embeddedComponent = createComponent([{name:componentName}]);

  return embeddedComponent.then(function (res) {
    var embededComponent = _.last(res),
      newSpaceLogicData = {
        embededComponent: {
          data: embededComponent
        }
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
