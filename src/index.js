var selector = require('./services/selector'),
  SpaceController = require('./controllers/space-controller'),
  invisibleLists = require('./services/invisible-lists'),
  utils = require('./services/utils'),
  dom = require('@nymag/dom');

// Load styles
require('./styleguide/styles.scss');

function updateSelector(el, options, parent) {
  var isSpaceComponent, availableSpaces;

  if (utils.checkIfSpaceEdit(options.ref)) {
    return;
  }

  isSpaceComponent = utils.checkIfSpace(options.ref);
  availableSpaces = utils.spaceInComponentList(parent);

  if (availableSpaces && availableSpaces.length > 0 && !isSpaceComponent) {
    selector.addAvailableSpaces(el, availableSpaces);
    selector.addCreateSpaceButton(el, options, parent);
    selector.stripSpaceFromComponentList(el);

  }

  if (isSpaceComponent) {
    selector.addAvailableSpaces(el, availableSpaces);
    SpaceController(el, parent);
    selector.addToComponentList(el, options, parent);

  }
}

window.kiln = window.kiln || {};
window.kiln.plugins = window.kiln.plugins || {};
window.kiln.plugins['spaces-edit'] = function initSpaces() {
  window.kiln.on('add-selector', updateSelector);
  window.kiln.on('component-pane:create-invisible-tab', invisibleLists);
};
