import { findSpaceParentUriAndList } from './utils';
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
    return Promise.reject(new Error('create space with multiple spaces available NOT YET IMPLEMENTED'));
  } else {
    try {
      return componentToSpace(store, ref, parentRef, availableSpaces[0])
        .then(function () {
          window.location.reload();
        });
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
export function findSpaceLogic(store, space) {
  const schema = store.state.schemas[space];

  if (!schema) {
    throw new Error(`Schema not found for space: ${space}`);
  } try {
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
 * Create a component wrapped in a Logic which is inside of a
 * component list in a Space
 *
 * @param {Object} store
 * @param {String} ref
 * @param {String} parentRef
 * @param {String} spaceName
 * @return {Promise} // promise for new space component
 */
function componentToSpace(store, ref, parentRef, spaceName) {
  const newSpaceLogicData = {
      embeddedComponent: {
        _ref: ref
      }
    },
    // create a space logic component with the target component
    newSpaceLogicCmpt = window.kiln.utils.create.default([{name:'space-logic', data: newSpaceLogicData}]),
    // find the area/componentList/etc where the component resides
    parentList = findSpaceParentUriAndList(ref).list;

  return newSpaceLogicCmpt
    .then((res)=>_.last(res))
    .then(function (newSpaceLogic) {
      const newSpaceData = {
        content: [
          newSpaceLogic
        ]
      };

      // create space component with the newly created space logic component
      return store.dispatch('addComponents', {
        parentURI: parentRef,
        currentURI: ref,
        path: parentList,
        replace: true,
        components: [
          {
            name: spaceName,
            data: newSpaceData
          }
        ]
      });
    })
    .catch(function () {
      throw new Error(`error creating space for ${ref}`);
    });
}
