var _ = require('lodash'),
  kilnServices = window.kiln.services,
  references = kilnServices.references,
  getAddableComponents = kilnServices.addComponentsHandler.getAddableComponents,
  spaceName = 'clay-space'

function makeComponentListAttr(parent) {
  var include = _.get(parent, 'list.include') || _.get(parent, 'prop.include'),
    exclude = _.get(parent, 'list.exclude') || _.get(parent, 'prop.exclude');

  return _.remove(getAddableComponents(include, exclude), function(component) {
    return component !== spaceName;
  });
}


module.exports.makeComponentListAttr = makeComponentListAttr;
