var _ = require('lodash'),
  references = require('references');

function makeComponentListAttr(parent) {
  var include = _.get(parent, 'list.include') || _.get(parent, 'prop.include'),
    exclude = _.get(parent, 'list.exclude') || _.get(parent, 'prop.exclude');

  return _.remove(references.availableComponents(include, exclude), function (component) {
    return component !== references.spaceClass;
  });
}

/**
 * Filter down a component list to the available Space
 * components. This will be used to inform the UI that
 * a Space is both available and allow for selecting
 * from specific Spaces.
 *
 * @param  {Array} componentList  A component list
 * @return {Array}
 */
function spaceInComponentList(componentList) {
  return _.filter(componentList, function (item) {
    return _.startsWith(item, references.spacePrefix) && item !== references.spaceEdit;
  });
}


module.exports.makeComponentListAttr = makeComponentListAttr;
module.exports.spaceInComponentList = spaceInComponentList;
