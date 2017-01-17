var selector = require('./selector'),
  SpaceController = require('./../controllers/space-controller'),
  utils = require('./utils'),
  _ = require('lodash');

/**
 * Updates a selector.
 * @param  {HtmlElement} el - component instance element
 * @param  {object} options
 * @param  {object} options.data - component instance data
 * @param  {string} options.ref - component instance ref
 * @param  {object} parent - Data of the containing component
 */
function updateSelector(el, options, parent) {
  var availableSpaces;

  if (utils.checkIfSpaceEdit(options.ref)) {
    return;
  }

  availableSpaces = utils.spaceInComponentList(parent);

  if (utils.checkIfSpace(options.ref)) {
    selector.addAvailableSpaces(el, availableSpaces);
    SpaceController(el, parent);
    selector.addToComponentList(el, options, parent);
  } else if (!_.isEmpty(availableSpaces)) {

    // pass available spaces to a data attribute of the component
    selector.addAvailableSpaces(el, availableSpaces);

    selector.addCreateSpaceButton(el, options, parent);
    selector.stripSpaceFromComponentList(el);
  }
}

module.exports.updateSelector = updateSelector;