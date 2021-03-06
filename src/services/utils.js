var dom = require('@nymag/dom'),
  _ = require('lodash'),
  references = require('./references');

/**
 * Checks that the string is a route while accounting for underscored routes
 * @param {string} string
 * @param {string} route
 * @return {boolean}
 */
function isRouteUri(string, route) {
  var routeFormat = '\/[_]?' + route + '\/';

  return !!string.match(routeFormat);
}

/**
 * Return information about the parent space logic
 * @param  {string} ref reference to the space components
 * @return {Object}
 */
export function findParentUriAndList(ref) {
  var el = dom.find(`[data-uri="${ref}"]`),
    parentList = dom.closest(el.parentNode, '[data-editable]'),
    parentEl = dom.closest(parentList, '[data-uri]'),
    parentUri = parentEl.getAttribute('data-uri'),
    parentListName = parentList.getAttribute('data-editable');

  if (isRouteUri(parentUri, 'pages')) {
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
 * @param  {Object}  store
 * @param  {Element} parentEl
 * @param  {String}  list
 * @return {Array}
 */
function getAvailableComponents(store, parentEl, list) {
  var parentUri = parentEl.getAttribute('data-uri'),
    parentName, componentList, include, exclude;

  if (isRouteUri(parentUri, 'pages')) {
    componentList = store.state.layout.schema[list]._componentList;
  } else {
    parentName = window.kiln.utils.references.getComponentName(parentUri);
    componentList = store.state.schemas[parentName][list]._componentList;
  }

  include = _.filter(_.get(componentList, 'include', ''), function (value) {
    // for site-specific components check that the component is available for
    // the current site
    const currentSlug = _.get(store, 'state.site.slug'),
      parens = /\(([^)]+)\)/;
    let includedSites;

    if (value.includes('(')) {
      includedSites = value.match(parens)[1];

      // check that the site is included OR not excluded
      if (includedSites.includes(currentSlug) || !includedSites.includes('not:' + currentSlug)) {
        // sanitize the name of the component. in schemas, the name of
        // site-specific components also includes the sites that the component
        // is available for
        return value.split('(')[0].trim();
      }
    } else {
      return value;
    }

  });

  exclude = _.get(componentList, 'exclude', '');

  return _.remove(window.kiln.utils.getAvailableComponents(store, include, exclude), function (component) {
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
 * @param {Object} store
 * @return {String[]}  The names of available space components, e.g. "clay-space" or "clay-space-ads"
 */
function spaceInComponentList(parent, store) {
  const possibleComponents = _.get(parent, '_componentList.include', []),
    exclude = _.get(parent, '_componentList.exclude', []);

  // Filter out components that are not Space components nor the Edit component
  return _.filter(window.kiln.utils.getAvailableComponents(store, possibleComponents, exclude), function (item) {
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
  return window.kiln.utils['filterable-list'].filterableList.create(items, callbacks);
}

/**
 * Checks if a reference is a type of Space.
 *
 * @param  {String} ref The uri of a component
 * @return {Boolean}
 */
function isClaySpace(ref) {
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
 * Check if the component uri is that of a space-logic component
 * @param  {String} uri
 * @return {Boolean}
 */
function isSpaceLogic(uri) {
  return uri.indexOf('/space-logic') > -1;
}

/**
 *  Grab the ancestor Space element closes to
 *  the Logic element passed in.
 *
 * @param  {Object} prefix
 * @param  {Element} logicEl
 * @return {Element}
 */
function getSpaceElFromLogic(prefix, logicEl) {
  var el = dom.closest(logicEl, `[data-uri^="${prefix}/components/clay-space"], [data-uri^="${prefix}/_components/clay-space"]`);

  return el;
}

module.exports.spaceInComponentList = spaceInComponentList;
module.exports.availableSpaces = availableSpaces;
module.exports.createFilterableList = createFilterableList;
module.exports.isClaySpace = isClaySpace;
module.exports.isSpaceLogic = isSpaceLogic;
module.exports.checkIfSpaceEdit = checkIfSpaceEdit;
module.exports.getAvailableComponents = getAvailableComponents;
module.exports.checkIfSpaceOrLogic = checkIfSpaceOrLogic;
module.exports.getSpaceElFromLogic = getSpaceElFromLogic;
