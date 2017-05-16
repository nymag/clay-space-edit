import dom from '@nymag/dom';
import _ from 'lodash';
import references from './references';
import utils from './utils';

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
 * @param  {Object} store
 * @param  {String} ref
 * @param  {String} parentRef
 * @param  {Array}  availableSpaces
 * @return {Promise} // indicates completion, doesn't return a value
 */
export function createSpace(store, ref, parentRef, availableSpaces) {
  if (availableSpaces.length > 1) {
    // TODO: implement
    throw new Error('create space with multiple spaces available NOT YET IMPLEMENTED');
    // selectSpace(availableSpaces, clickedComponent, options, parent);
  } else {
    return componentToSpace(store, ref, parentRef, availableSpaces[0]);
  }
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
  try {
    const componentList = schema.content._componentList.include,
      spaceLogic = componentList.find(componentName => componentName.includes('space-logic'));

    if (!spaceLogic) {
      throw new Error('Logic not found. Expected a component with \'space-logic\' in its name.');
    }

    return spaceLogic;

  } catch (err) {
    throw new Error( 'The `content` field for a space must be a `_componentList` that contains exactly 1 Logic.'
                     + ` Check the schema.yml for ${space}, it should be like this:\n`
                     + 'content:\n  _componentList:\n    include:\n      space-logic-ads'
                     + '\n ' + err.message);
  }
}

/**
 * thin wrapper around Kiln Vuex API
 * for `addComponents` action
 *
 * @param {Object} store
 * @param {Object} addComponentsPayload // see Kiln docs
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
 * @param {Object} store
 * @param {String} ref
 * @param {String} parentRef
 * @param {String} spaceName
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

    return addComponents(store, {
      parentURI: spaceRef,
      path: 'content',
      components: [{ name: logicName, data: {
        embeddedComponent: {
          _ref: ref
        }
      } }],
    })
    // just returning a promise for completion, not a value (yet)
    .then(() => {});
  });
}
