
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
    return Promise.reject(new Error('create space with multiple spaces available NOT YET IMPLEMENTED'));
    // selectSpace(availableSpaces, clickedComponent, options, parent);
  } else {
    try {
      return componentToSpace(store, ref, parentRef, availableSpaces[0]);
    } catch (err) {
      return Promise.reject(err);
    }
  }
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
  return addComponents(store, {
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
    .then(() => Promise.resolve());
  });
}
