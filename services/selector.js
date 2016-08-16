var _ = require('lodash'),
  dom = require('@nymag/dom'),
  tpl = window.kiln.services.tpl,
  createService = require('./create-service'),
  selectSpaceParent = require('./select-space-parent');

function addCreateSpaceButton(el, options, parent) {
  var parentButton = dom.find(el, '.selected-action-settings'),
    createSpaceButton = tpl.get('.create-space'),
    createButton;

  dom.insertAfter(parentButton, createSpaceButton);

  createButton = dom.find(el, '.space-create');
  createButton.addEventListener('click', createService.createSpace.bind(null, options, parent));
}

function swapSelectParentButton(el) {
  var kilnParentButton = dom.find(el, '.selected-info-parent'),
  spaceParentButton = tpl.get('.parent-space'),
  spaceButton;

  // Hide the original parent selector button provided by kiln
  kilnParentButton.classList.add('kiln-hide');
  // Insert a button that will mimic the functionality of the kiln parent
  dom.insertAfter(kilnParentButton, spaceParentButton);

  spaceButton = dom.find(el, '.space-parent');
  spaceButton.addEventListener('click', selectSpaceParent.bind(null, el));
}

module.exports.addCreateSpaceButton = addCreateSpaceButton;
module.exports.swapSelectParentButton = swapSelectParentButton;
