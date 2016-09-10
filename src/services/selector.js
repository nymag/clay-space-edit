var _ = require('lodash'),
  dom = require('@nymag/dom'),
  references = require('references'),
  createService = require('./create-service'),
  removeService = require('./remove-service'),
  selectSpaceParent = require('./select-space-parent'),
  SpaceSettings = require('../controllers/space-settings-controller');

/**
 * [addCreateSpaceButton description]
 * @param {[type]} el
 * @param {[type]} options
 * @param {[type]} parent
 */
function addCreateSpaceButton(el, options, parent) {
  var parentButton = dom.find(el, '.selected-actions'),
    createSpaceButton = references.tpl.get('.create-space'),
    createButton;

  parentButton.appendChild(createSpaceButton);

  createButton = dom.find(el, '.space-create');
  createButton.addEventListener('click', createService.createSpace.bind(null, options, parent));
}

/**
 * [launchAddComponent description]
 * @param  {[type]} element
 * @param  {[type]} options
 * @param  {[type]} parent
 */
function launchAddComponent(element, options, parent) {
  var spaceParent = dom.closest(element, '.clay-space'),
    availableComponents = spaceParent.getAttribute('data-components').split(','),
    paneContent = references.filterableList.create(availableComponents, {
      click: createService.fakeAnAddToComponentList.bind(null, options, parent)
    });

  references.pane.open([{ header: 'Add Component', content: paneContent }]);
}

/**
 * [addCreateSpaceButton description]
 * @param {[type]} el
 * @param {[type]} options
 * @param {[type]} parent
 */
function addToComponentList(el, options, parent) {
  var logics = el.classList.contains('space-logic') ? [el] : dom.findAll(el, '.space-logic'),
    bottom,
    addButton;

  _.each(logics, function (logic) {
    bottom = dom.find(dom.find(logic, '[data-uri]'), '.component-selector-bottom');

    if (bottom) {
      addButton = dom.find(bottom, '.selected-add');
      bottom.classList.remove('kiln-hide');
      addButton.classList.remove('kiln-hide');
      addButton.addEventListener('click', launchAddComponent.bind(null, addButton, options, parent));
    }
  });
}

/**
 * [swapSelectParentButton description]
 * @param  {[type]} el
 */
function swapSelectParentButton(el) {
  var kilnParentButton = dom.find(el, '.selected-info-parent'),
    kilnSettingsButton = dom.find(el, '.selected-action-settings'),
    spaceParentButton = references.tpl.get('.parent-space'),
    spaceButton;

  // Hide the original parent selector button provided by kiln
  kilnParentButton.classList.add('kiln-hide');
  // Insert a button that will mimic the functionality of the kiln parent
  dom.insertAfter(kilnSettingsButton, spaceParentButton);

  spaceButton = dom.find(el, '.space-parent');
  spaceButton.addEventListener('click', selectSpaceParent.bind(null, el));
}

/**
 * [revealAddComponentButton description]
 * @param  {[type]} el
 * @return {[type]}
 */
function revealAddComponentButton(el) {
  var targetComponent = dom.find(el, '[data-uri]'),
    addComponentButton = dom.find(targetComponent, '.selected-add'),
    componentsAttr = el.parentElement ? el.parentElement.getAttribute('data-components') : el.getAttribute('data-components');

  dom.find(targetComponent, '.component-selector-bottom').classList.remove('kiln-hide');
  addComponentButton.classList.remove('kiln-hide');
  addComponentButton.setAttribute('data-components', componentsAttr);

  return addComponentButton;
}

/**
 * [addBrowseButton description]
 * @param {[type]} logicComponent
 * @return {SpaceController}
 */
function addBrowseButton(logicComponent) {
  var targetButton = dom.find(logicComponent, '.space-browse'),
    embeddedComponent,
    embeddedComponentParentButton,
    browseSpaceButton,
    browseButton;

  // If there's not a `targetButton`, add it!
  if (!targetButton || !embeddedComponent) {
    embeddedComponent = dom.find(logicComponent, '[data-uri]');
    embeddedComponentParentButton = dom.find(embeddedComponent, '.selected-actions');
    browseSpaceButton = references.tpl.get('.browse-space');
  }

  if (embeddedComponent && embeddedComponentParentButton) {
    // Insert the button
    embeddedComponentParentButton.appendChild(browseSpaceButton);
    // Assign the proper reference to `browseButton`
    browseButton = targetButton ? targetButton : dom.find(logicComponent, '.space-browse');
    // Add an event listener
    browseButton.addEventListener('click', () => {
      launchBrowsePane(this.el, {
        add: this.onAddCallback.bind(this),
        remove: this.onRemoveCallback.bind(this)
      });
    });
  }
  return this;
}

/**
 * [launchBrowsePane description]
 * @param  {Element} spaceElement [description]
 * @param  {Object} callbacks    [description]
 */
function launchBrowsePane(spaceElement, callbacks) {
  SpaceSettings(spaceElement, callbacks);
}

function addRemoveButton(logic) {
  var removeButton = dom.find(dom.find(logic, '[data-uri]'), '.selected-action-delete');

  if (removeButton) {
    removeButton.classList.remove('kiln-hide');
    removeButton.addEventListener('click', removeService.removeIconClick.bind(this, logic));
  }
}

/**
 * Remove 'clay-space' from a component list
 * @param  {Element} el
 */
function stripSpaceFromComponentList(el) {
  var addButton = dom.find(el, '.selected-add'),
    components = addButton.getAttribute('data-components').split(','),
    componentsSansSpace = _.pull(components, references.spaceClass);

  addButton.setAttribute('data-components', componentsSansSpace);
}

module.exports.addCreateSpaceButton = addCreateSpaceButton;
module.exports.swapSelectParentButton = swapSelectParentButton;
module.exports.addToComponentList = addToComponentList;
module.exports.launchAddComponent = launchAddComponent;
module.exports.launchBrowsePane = launchBrowsePane;
module.exports.revealAddComponentButton = revealAddComponentButton;
module.exports.addBrowseButton = addBrowseButton;
module.exports.addRemoveButton = addRemoveButton;
module.exports.stripSpaceFromComponentList = stripSpaceFromComponentList;
