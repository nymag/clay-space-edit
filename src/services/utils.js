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


module.exports.makeComponentListAttr = makeComponentListAttr;
module.exports.spaceInComponentList = spaceInComponentList;

