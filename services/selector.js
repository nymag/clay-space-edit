var _ = require('lodash'),
  dom = require('@nymag/dom'),
  tpl = window.kiln.services.tpl,
  createService = require('./create-service');

function addCreateSpaceButton(el, options, parent) {
  var parentButton = dom.find(el, '.selected-action-settings'),
    createSpaceButton = tpl.get('.create-space'),
    createButton;

  dom.insertAfter(parentButton, createSpaceButton);

  createButton = dom.find(el, '.space-create');
  createButton.addEventListener('click', createService.createSpace.bind(null, options, parent));
}

module.exports.addCreateSpaceButton = addCreateSpaceButton;
