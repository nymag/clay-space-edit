import dom from '@nymag/dom';
import { getAvailableComponents, findSpaceParentUriAndList } from './utils';
import { findSpaceLogic } from './create-service';

const getComponentName = window.kiln.utils.references.getComponentName,
  // why do I need to refer to `.default`?
  createComponent = window.kiln.utils.create.default;

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


    /*
      TODO:
      - use arrow syntax?
      - remove ref from first-runs
    */

    embeddedComponent.then(function (res) {
      var embededComponent = _.last(res),
      newSpaceLogicData = {
        embededComponent: {
          data: embededComponent
        }
      };
      console.log("component:", embededComponent);
      console.log("newSpaceLogicData:", newSpaceLogicData);
      debugger;

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
    // REFERENCE:
    // var createdComponent = _.last(store.state.components[spaceRef].content)._ref;

    /*
      TODO:
      - create embedded component
      - dispatch `addComponents` event

    */

  // return store.dispatch('addComponents', {
  //   parentURI: spaceRef,
  //   currentURI: lastSpaceLogic,
  //   path: 'content',
  //   replace: false,
  //   components: [{ name: logic }]
  // });
}
