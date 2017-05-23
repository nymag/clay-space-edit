var dom = require('@nymag/dom'),
  _ = require('lodash'),
  references = require('./references');


// TODO: Collapse into global references
const kilnUtils = window.kiln.utils,
  getComponentName = kilnUtils.references.getComponentName,
  filterAvailable = kilnUtils.getAvailableComponents;


/**
 * TODO: Fill in
 * @param  {[type]} spaceRef [description]
 * @return {[type]}          [description]
 */
export function findSpaceParentUriAndList(spaceRef) {
  var spaceEl = dom.find(`[data-uri="${spaceRef}"]`),
    parentList = dom.closest(spaceEl, '[data-editable]'),
    parentEl = dom.closest(parentList, '[data-uri]'),
    parentUri = parentEl.getAttribute('data-uri'),
    parentListName = parentList.getAttribute('data-editable');

  if (parentUri.indexOf('/pages/') > -1) {
    parentUri = parentEl.getAttribute('data-layout-uri');
  }

  return {
    el: parentEl,
    uri: parentUri,
    list: parentListName
  };
}

/**
 * Return a list of components included in a component list. Requires
 * a component's uri and a list from that component's schema.
 *
 * TODO: Just pass in Parent object?
 *
 *
 * @param  {Object}  store
 * @param  {Element} parentUri
 * @param  {String}  list
 * @return {Array}
 */
function getAvailableComponents(store, parentEl, list) {
  var parentUri = parentEl.getAttribute('data-uri'),
    parentName, componentList, include, exclude;

  if (parentUri.indexOf('/pages/') > -1) {
    parentUri = parentEl.getAttribute('data-layout-uri');
  }

  parentName = getComponentName(parentUri);

  componentList = store.state.schemas[parentName][list]._componentList;
  include = _.get(componentList, 'include', '');
  exclude = _.get(componentList, 'exclude', '');

  return _.remove(filterAvailable(include, exclude), function (component) {
    return component === references.spaceEdit || !_.startsWith(component, references.spacePrefix);
  });
}

/**
 * Return an array of components available in a
 * component list that are not prefixed with `clay-space`,
 * but include the `clay-space-edit` component
 *
 * TODO: Fix this documentation and make this function more generic. Deprecate for above function
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
 * @return {String[]}  The names of available space components, e.g. "clay-space" or "clay-space-ads"
 */
function spaceInComponentList(parent) {
  const possibleComponents = _.get(parent, '_componentList.include', []),
    exclude = _.get(parent, '_componentList.exclude', []);

  // Filter out components that are not Space components nor the Edit component
  return _.filter(references.availableComponents(possibleComponents, exclude), function (item) {
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

/**
 * Checks if a reference is a type of Space.
 *
 * @param  {String} ref The uri of a component
 * @return {Boolean}
 */
function checkIfSpaceOrLogic(ref) {
  return _.includes(ref, 'space-logic') || _.includes(ref, references.spacePrefix);
}

/**
 * Checks if a reference is the Space Edit component.
 *
 * @param  {String} ref The uri of a component
 * @return {Boolean}
 */
function checkIfSpaceEdit(ref) {
  return _.includes(ref, references.spaceEdit);
}

/**
 * Return an array of all components with the
 * `data-logic` attribute
 *
 * @param  {Element} el
 * @return {Array}
 */
function findAllLogic(el) {
  return dom.findAll(el, '[data-logic]');
}

/**
 * TODO: Document. Move to references? Let's decide.
 * What harm can ANOTHER closure do?
 * @param  {String} uri
 * @return {String}
 */
function componentNameFromURI(uri) {
  return window.kiln.utils.references.getComponentName(uri);
}

module.exports.componentNameFromURI = componentNameFromURI;
module.exports.makeComponentListAttr = makeComponentListAttr;
module.exports.spaceInComponentList = spaceInComponentList;
module.exports.availableSpaces = availableSpaces;
module.exports.createFilterableList = createFilterableList;
module.exports.checkIfSpace = checkIfSpace;
module.exports.checkIfSpaceEdit = checkIfSpaceEdit;
module.exports.findAllLogic = findAllLogic;
module.exports.getAvailableComponents = getAvailableComponents;
module.exports.checkIfSpaceOrLogic = checkIfSpaceOrLogic;
