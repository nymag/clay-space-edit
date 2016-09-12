var _ = require('lodash'),
  spaceName = 'clay-space',
  selector = require('./services/selector'),
  SpaceController = require('./controllers/space-controller'),
  utils = require('./services/utils');

// Load styles
require('./styleguide/styles.scss');

function updateSelector(el, options, parent) {
  var isSpaceComponent = el.classList.contains(spaceName),
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

// Export the init entrypoint
window.kiln.plugins['spaces-edit'] = function initSpaces() {
  window.kiln.on('add-selector', updateSelector);
};
