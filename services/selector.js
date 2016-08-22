var _ = require('lodash'),
  dom = require('@nymag/dom'),
  kilnServices = window.kiln.services,
  tpl = kilnServices.tpl,
  filterableList = kilnServices['filterable-list'],
  pane = kilnServices.pane,
  utils = require('./utils'),
  createService = require('./create-service'),
  selectSpaceParent = require('./select-space-parent');

/**
 * [addCreateSpaceButton description]
 * @param {[type]} el      [description]
 * @param {[type]} options [description]
 * @param {[type]} parent  [description]
 */
function addCreateSpaceButton(el, options, parent) {
  var parentButton = dom.find(el, '.selected-action-settings'),
    createSpaceButton = tpl.get('.create-space'),
    createButton;

  dom.insertAfter(parentButton, createSpaceButton);

  createButton = dom.find(el, '.space-create');
  createButton.addEventListener('click', createService.createSpace.bind(null, options, parent));
}

/**
 * [launchAddComponent description]
 * @param  {[type]} element [description]
 * @param  {[type]} options [description]
 * @param  {[type]} parent  [description]
 * @return {[type]}         [description]
 */
function launchAddComponent(element, options, parent) {
  var spaceParent = dom.closest(element, '.clay-space'),
    availableComponents = spaceParent.getAttribute('data-components').split(','),
    paneContent = filterableList.create(availableComponents, {
      click: createService.fakeAnAddToComponentList.bind(null, options, parent)
    });

  pane.open([{ header: 'Add Component', content: paneContent }]);
}

/**
 * [addCreateSpaceButton description]
 * @param {[type]} el      [description]
 * @param {[type]} options [description]
 * @param {[type]} parent  [description]
 */
function addToComponentList(el, options, parent) {
  var bottom = dom.find(dom.find(dom.find(el, '.space-logic'), '[data-uri]'), '.component-selector-bottom'),
    addButton = dom.find(bottom, '.selected-add');


  bottom.classList.remove('kiln-hide');
  addButton.classList.remove('kiln-hide');
  addButton.addEventListener('click', launchAddComponent.bind(null, addButton, options, parent));
}

/**
 * [swapSelectParentButton description]
 * @param  {[type]} el [description]
 * @return {[type]}    [description]
 */
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
module.exports.addToComponentList = addToComponentList;
