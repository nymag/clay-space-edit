import dom from '@nymag/dom';
import { getAvailableComponents, findSpaceParentUriAndList } from './utils';
import { findSpaceLogic } from './create-service';

const getComponentName = window.kiln.utils.references.getComponentName;



export function findAvailableComponents(store, spaceRef) {
  const parent = findSpaceParentUriAndList(spaceRef);

  return getAvailableComponents(store, parent.el, parent.list);
}


export function addToSpace(store, spaceRef, componentName) {
  var parent =  findSpaceParentUriAndList(spaceRef),
    logic = findSpaceLogic(store, getComponentName(spaceRef));


  return addComponent(store, {
    parentURI: spaceRef,
    path: 'content',
    replace: false,
    components: [{ name: componentName }]
  }).then((resp) => {
    // TODO: Why is this not returning the logic uri?
    const createdComponent = _.last(store.state.components[spaceRef].content)._ref;

    return addComponent(store, {
      parentURI: spaceRef,
      currentURI: createdComponent,
      path: 'content',
      components: [{ name: logic, data: {
          component: { _ref: createdComponent }
        }
      }],
      replace: true
    });
  });
}

function addComponent(store, { currentURI, parentURI, path, components, replace }) {
  return store.dispatch('addComponents', {
    currentURI,
    parentURI,
    path,
    components,
    replace
  });
}
