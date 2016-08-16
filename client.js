var dom = require('@nymag/dom'),
  _ = require('lodash'),
  spaceName = 'clay-space',
  selector = require('./services/selector'),
  SpaceController = require('./controllers/space-controller');

function updateSelector(el, options, parent) {
  var isSpaceComponent = el.classList.contains(spaceName),
    parentIsSpaceLogic = parent.ref && parent.ref.indexOf('space-logic') > -1;

  if (_.get(parent, 'list.include', '') && _.contains(parent.list.include, spaceName) && !isSpaceComponent) {
    selector.addCreateSpaceButton(el, options, parent);
  }

  if (parentIsSpaceLogic) {
    selector.swapSelectParentButton(el);
  }

  if (isSpaceComponent) {
    SpaceController(el, options, parent);
  }
}

function onAddSelector() {
  window.kiln.on('add-selector', updateSelector);
}

// Export the init entrypoint
window.kiln.plugins['spaces-edit'] = onAddSelector;
