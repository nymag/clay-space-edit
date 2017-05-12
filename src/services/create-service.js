import dom from '@nymag/dom';
import _ from 'lodash';
import references from './references';
import utils from './utils';

/**
 * Take the name of the Space and the desired component to be created
 * and wrap that component in a Logic and add to the Space. The Space
 * name is needed because we do a lookup in the schema to see which
 * logic is available to it.
 *
 * @param  {String} spaceName     Name of the Space component is going in
 * @param  {String} componentName Name of the component to create
 * @return {Promise}
 */
function newComponentInLogic(spaceName, componentName) {
  return findSpaceLogic(spaceName)
    .then(function (logicComponent) {
      return references.edit.createComponent(componentName)
        .then(function (component) {
          return references.edit.createComponent(logicComponent, {
            embeddedComponent: {
              ref: component._ref,
              data: {
                _ref: component._ref
              }
            }
          });
        });
    });
}

/**
 * Take a component, wrap it in a Logic component, and then return
 * the Logic component's data.
 *
 * @param  {String}  logicComponent   The name of the logic component
 * @param  {Element} clickedComponent The element that was clicked to create the space
 * @param  {Object}  options          Component options
 * @param  {Object}  parent           Parent component
 * @return {Promise}
 */
function wrapInLogic(logicComponent, clickedComponent, options, parent) {
  return Promise.all([
    references.edit.createComponent(logicComponent, { embeddedComponent: options }),
    references.edit.removeFromParentList({ el: clickedComponent, ref: options.ref, parentField: parent.path, parentRef: parent.ref })
  ]).then(function (resp) {
    return resp[0];
  });
}

/**
 * // TODO: remove when we're sure we don't need it
 * [findPrevRef description]
 * @param  {[type]} targetComponent [description]
 * @return {[type]}                 [description]
 */
function findPrevRef(targetComponent) {
  var targetRef = targetComponent.getAttribute('data-uri'),
    allComponentsInList = targetComponent.parentElement.children,
    indexOfTarget = null,
    prevRef = '',
    above = false;

  _.forEach(allComponentsInList, function (component, index) {
    if (targetRef === component.getAttribute('data-uri')) {
      indexOfTarget = index;
    }
  });

  if (!indexOfTarget) {
    prevRef = allComponentsInList[indexOfTarget + 1].getAttribute('data-uri');
    above = true;
  } else {
    prevRef = allComponentsInList[indexOfTarget - 1].getAttribute('data-uri');
  }

  return { prevRef: prevRef, above: above };
}

/**
 * At this stage the component has already been wrapped in newly created
 * Logic component. This function then creats a Space per the user's
 * selection and adds that Logic to the Space and adds the Space to the
 * componentList of the original component.
 *
 * @param {String} space
 * @param {Object} options
 * @param {Object} parent
 * @param {Object} position
 * @param {Object} logicComponent
 * @return {Promise}
 */
function addInSpace(space, options, parent, position, logicComponent) {
  return Promise.all([references.edit.createComponent(space, { content: [{ _ref: logicComponent[references.referenceProperty] }] }), references.edit.getData(parent.ref)])
    .then(function (promises) {
      var res = promises[0],
        newRef = res._ref,
        args = {
          ref: newRef,
          parentField: parent.path,
          parentRef: parent.ref,
          prevRef: position.prevRef,
          above: position.above
        };

      return references.edit.addToParentList(args)
        .then(function (newEl) {
          return attachHandlersAndFocus(newEl);
        });
    });
}

/**
 * Find the component to convert to a Space, find the Spaces available
 * in the parent's component list, figure out which Space needs to be
 * created, make it happen.
 *
 * @param  {Object} options
 * @param  {Object} parent
 * @return {Promise}
 */
function createSpace(store, ref, parentRef, availableSpaces) {
  if (availableSpaces.length > 1) {
    // TODO: implement
    throw new Error('create space with multiple spaces available NOT YET IMPLEMENTED');
    // selectSpace(availableSpaces, clickedComponent, options, parent);
  } else {
    return componentToSpace(store, ref, parentRef, availableSpaces[0]);
  }
}

/**
 * Prompt the user to see if they're sure they want to make a Space.
 *
 * @return {Boolean}
 */
function confirmMakeSpace() {
  return window.confirm('Do you really want to make a new Space?');
}

/**
 * If there is more than one type of Space available in a
 * component list then open a pane to allow the user to choose
 * which Space they want
 *
 * @param {Array}   availableSpaces
 * @param {Element} clickedComponent
 * @param {Object}  options
 * @param {Object}  parent
 */
function selectSpace(availableSpaces, clickedComponent, options, parent) {
  references.pane.open([{
    header: 'Choose A Space',
    content: utils.createFilterableList(availableSpaces, {
      click: spaceSelectCallback.bind(null, clickedComponent, options, parent)
    })
  }]);
}

/**
 * Callback function when a user selects which Space to create.
 * Close the pane, kick off the process.
 *
 * @param  {Element} clickedComponent
 * @param  {Object}  options
 * @param  {Object}  parent
 * @param  {String}  id
 * @return {Promise}
 */
function spaceSelectCallback(clickedComponent, options, parent, id) {
  if (!confirmMakeSpace()) {
    return;
  }

  references.pane.close();

  return componentToSpace(clickedComponent, options, parent, id);
}

/**
 * Grab the schema for whatever Space component is selected and
 * find the Logic component available to it.
 *
 * @param {Object} store Vuex store
 * @param  {String} space  name of the space
 * @return {String} logicRef
 */
function findSpaceLogic(store, space) {
  const schema = store.state.schemas[space];

  if (!schema) {
    throw new Error(`Schema not found for space: ${space}`);
  }
  if (!schema.content
      || !schema.content._componentList
      || !schema.content._componentList.include
      || schema.content._componentList.include.length !== 1
      || !schema.content._componentList.include[0].includes('space-logic')
    ) {
    throw new Error( 'The `content` field for a space must be a `_componentList` that contains exactly 1 Logic.'
                     + ` Check the schema.yml for ${space}, it should be like this:\n`
                     + 'content:\n  _componentList:\n    include:\n      space-logic-ads');
  }

  return schema.content._componentList.include[0];
}

/**
 * thin wrapper around Kiln Vuex API
 * for `addComponents` action
 *
 * @param {Object} store
 * @param {addComponentsPayload} // see Kiln docs
 * @return {Promise} // promise for new component DOM element
 *
 */
function addComponents(store, { currentURI, parentURI, path, replace, components }) {
  return store.dispatch('addComponents', {
    currentURI,
    parentURI,
    path,
    components,
    replace
  });
}

/**
 * Create a componenet wrapped in a Logic which is inside of a
 * component list in a Space
 *
 */
function componentToSpace(store, ref, parentRef, spaceName) {
   // TODO: break this function up into pieces
  const logicName = findSpaceLogic(store, spaceName);

  // replace selected component with a new space instance
  addComponents(store, {
    currentURI: ref, // so Kiln knows what to replace
    replace: true,
    parentURI: parentRef,
    path: store.state.ui.currentSelection.parentField.path,
    components: [{ name: spaceName }]
  })
  .then(spaceEl => {
    if (!spaceEl) {
      throw new Error(`error creating space for ${ref}`);
    }
    // add a new instance of the logic to the space
    const spaceRef = spaceEl.dataset.uri;
    console.log('spaceRef: ', store.state.components[spaceRef]);

    return addComponents(store, {
      parentURI: spaceRef,
      path: 'content',
      components: [{ name: logicName, data: {
        embeddedComponent: {
          _ref: ref
        }
      } }],
    });
  });
}

/**
 * [attachHandlersAndFocus description]
 * @param  {[type]} el [description]
 * @return {[type]}    [description]
 */
function attachHandlersAndFocus(el) {
  return references.render.addComponentsHandlers(el).then(function () {
    references.focus.unfocus();
    references.select.unselect();
    references.select.select(el);
    return el;
  });
}

/**
 * [fakeAnAddToComponentList description]
 * @param  {Object} options
 * @param  {Object} parent
 * @param  {String} componentToAdd
 * @return {Promise}
 */
function fakeAnAddToComponentList(options, parent, componentToAdd) {
  return references.addComponent(parent.listEl, parent, componentToAdd, options.ref)
    .then(function () {
      references.pane.close();
    });
}

module.exports.createSpace = createSpace;
module.exports.newComponentInLogic = newComponentInLogic;
module.exports.attachHandlersAndFocus = attachHandlersAndFocus;
module.exports.fakeAnAddToComponentList = fakeAnAddToComponentList;

