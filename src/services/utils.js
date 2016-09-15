var _ = require('lodash'),
  references = require('references');

/**
 * Return an array of components available in a
 * component list that are not prefixed with `clay-space`,
 * but include the `clay-space-edit` component
 *
 * @param  {Object} parent  The parent component which contains a componentList
 * @return {Array}
 */
function makeComponentListAttr(parent) {
  var include = _.get(parent, 'list.include', '') || _.get(parent, 'prop.include', ''),
    exclude = _.get(parent, 'list.exclude', '') || _.get(parent, 'prop.exclude', '');

  return _.remove(references.availableComponents(include, exclude), function (component) {
    return component === references.spaceEdit || !_.startsWith(component, references.spacePrefix);
  });
}

/**
 * Filter down a component list to the available Space
 * components. This will be used to inform the UI that
 * a Space is both available and allow for selecting
 * from specific Spaces.
 *
 * @param  {Object} parent  The parent component which contains a componentList
 * @return {Array}
 */
function spaceInComponentList(parent) {
  var include = _.get(parent, 'list.include', '') || _.get(parent, 'prop.include', ''),
    exclude = _.get(parent, 'list.exclude', '') || _.get(parent, 'prop.exclude', '');

  // Filter out components that are not Space components nor the Edit component
  return _.filter(references.availableComponents(include, exclude), function (item) {
    return _.startsWith(item, references.spacePrefix) && item !== references.spaceEdit;
  });
}

/**
 * Return a string with the Space that a user wants to
 * wrap a component in.
 *
 * @param  {Element} el  The component that is being initially wrapped in a Space
 * @return {String}
 */
function availableSpaces(el) {
  return el.getAttribute(references.dataAvailableSpaces).split(',');
}

/**
 * Create the HTML for a filterable list as provided by Kiln
 *
 * @param  {Array} items
 * @param  {Object} callbacks
 * @return {Element}
 */
function createFilterableList(items, callbacks) {
  return references.filterableList.create(items, callbacks);
}

/**
 * Checks if a reference is a type of Space.
 *
 * @param  {String} ref The uri of a component
 * @return {Boolean}
 */
function checkIfSpace(ref) {
  return _.includes(ref, references.spacePrefix);
}

module.exports.makeComponentListAttr = makeComponentListAttr;
module.exports.spaceInComponentList = spaceInComponentList;
module.exports.availableSpaces = availableSpaces;
module.exports.createFilterableList = createFilterableList;
module.exports.checkIfSpace = checkIfSpace;
