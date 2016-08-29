var _ = require('lodash'),
  spaceName = 'clay-space',
  selector = require('./services/selector'),
  SpaceController = require('./controllers/space-controller');

// Load styles
require('./styleguide/styles.scss');

function updateSelector(el, options, parent) {
  var isSpaceComponent = el.classList.contains(spaceName);

  if (_.get(parent, 'list.include', '') && _.includes(parent.list.include, spaceName) && !isSpaceComponent) {
    selector.addCreateSpaceButton(el, options, parent);
    selector.stripSpaceFromComponentList(el);
  }

  if (isSpaceComponent) {
    SpaceController(el, parent);
    selector.addToComponentList(el, options, parent);
  }
}

// Export the init entrypoint
window.kiln.plugins['spaces-edit'] = function initSpaces() {
  window.kiln.on('add-selector', updateSelector);
};
