var _ = require('lodash'),
  references = require('references');

function makeComponentListAttr(parent) {
  var include = _.get(parent, 'list.include') || _.get(parent, 'prop.include'),
    exclude = _.get(parent, 'list.exclude') || _.get(parent, 'prop.exclude');

  return _.remove(references.availableComponents(include, exclude), function (component) {
    return component !== references.spaceClass;
  });
}


module.exports.makeComponentListAttr = makeComponentListAttr;
