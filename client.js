var dom = require('@nymag/dom'),
  _ = require('lodash'),
  spaceName = 'clay-space',
  selector = require('./services/selector'),
  saveService = require('./services/save-service'),
  SpaceController = require('./controllers/space-controller');

function updateSelector(el, options, parent) {
  var isSpaceComponent = el.classList.contains(spaceName),
    parentIsSpaceLogic = parent.ref && parent.ref.indexOf('space-logic') > -1;

  if (_.get(parent, 'list.include', '') && _.contains(parent.list.include, spaceName) && !isSpaceComponent) {
    selector.addCreateSpaceButton(el, options, parent);
  }

  if (isSpaceComponent) {
    SpaceController(el, parent);
    selector.addToComponentList(el, options, parent);
  }

  if (parentIsSpaceLogic) {
    selector.swapSelectParentButton(el);
  }
}

// Export the init entrypoint
window.kiln.plugins['spaces-edit'] = function initSpaces() {
  window.kiln.on('add-selector', updateSelector);

  window.kiln.on('save', function onLogicSave(component) {
    if (_.contains(component._ref, 'space-logic')) {
      saveService(component);
    }
  });
};
