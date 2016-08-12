var dom = require('@nymag/dom'),
  _ = require('lodash'),
  spaceName = 'clay-space',
  selector = require('./services/selector'),
  SpaceController = require('./controllers/space-controller'),
  SpaceLogicController = require('./controllers/space-logic-controller');

function updateSelector(el, options, parent) {
  var isSpaceComponent = el.classList.contains(spaceName),
    isSpaceLogicComponent = el.classList.contains('space-logic');

  if (_.get(parent, 'list.include', '') && _.contains(parent.list.include, spaceName) && !isSpaceComponent) {
    selector.addCreateSpaceButton(el, options, parent);
  }

  if (isSpaceComponent) {
    SpaceController(el, options, parent);
  }

  if (isSpaceLogicComponent) {
    SpaceLogicController(el, options, parent);
  }
}

function onAddSelector() {
  window.kiln.on('add-selector', updateSelector);
}

// Export the init entrypoint
window.kiln.plugins['spaces-edit'] = onAddSelector;
