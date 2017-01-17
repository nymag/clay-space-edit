var _ = require('lodash'),
  dom = require('@nymag/dom'),
  references = require('references'),
  utils = require('./utils'),
  createService = require('./create-service'),
  removeService = require('./remove-service'),
  statusService = require('./status-service'),
  SpaceSettings = require('../controllers/space-settings-controller'),
  SpaceController = require('./../controllers/space-controller');

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
  var spaceParent = dom.closest(element, '[data-space]'),
    availableComponents = spaceParent.getAttribute('data-components').split(','),
    paneContent = utils.createFilterableList(availableComponents, {
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
  var logics = statusService.isLogic(el) ? [el] : utils.findAllLogic(el),
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
    if (!targetButton) {
      embeddedComponentParentButton.appendChild(browseSpaceButton);
    }

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
  SpaceSettings(spaceElement, callbacks, false);
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
 *
 * TODO: Make the removal from component lists dynamic
 */
function stripSpaceFromComponentList(el) {
  var addButton = dom.find(el, '.selected-add'),
    components = addButton.getAttribute('data-components').split(','),
    componentsSansSpace = _.pull(components, references.spacePrefix);

  addButton.setAttribute('data-components', componentsSansSpace);
}

/**
 * Add a data attribute to components when a Space is
 * available. This attribute contains all the Spaces
 * that can be made out of this component
 *
 * @param {Element} el             The element to add the attribute to
 * @param {Array} availableSpaces  Array of strings with available Spaces
 */
function addAvailableSpaces(el, availableSpaces) {
  if (!availableSpaces.length) {
    return;
  }

  el.setAttribute(references.dataAvailableSpaces, availableSpaces.join(','));
}

/**
 * If the component of a given element is a space component or
 * is in a component list that allows space components,
 * add buttons to its selector allowing the space to be
 * updated or a new space to be added.
 * @param  {Element} el component instance element
 * @param  {object} options
 * @param  {object} options.data - component instance data
 * @param  {string} options.ref - component instance ref
 * @param  {object} parent - data of the containing component
 */
function updateSelector(el, options, parent) {
  var availableSpaces;

  console.log('-----------------------');
  console.log('updating selector: ', el, options, parent);

  if (utils.checkIfSpaceEdit(options.ref)) return; // ignore space-edit component

  availableSpaces = utils.spaceInComponentList(parent);
  console.log('available spaces: ', availableSpaces);

  if (utils.checkIfSpace(options.ref)) { // if element is space component
    addAvailableSpaces(el, availableSpaces);
    SpaceController(el, parent);
    addToComponentList(el, options, parent);
  } else if (!_.isEmpty(availableSpaces)) { // if element is space sibling
    addAvailableSpaces(el, availableSpaces);
    addCreateSpaceButton(el, options, parent);
    stripSpaceFromComponentList(el);
  }
}


module.exports.addCreateSpaceButton = addCreateSpaceButton;
module.exports.addToComponentList = addToComponentList;
module.exports.launchAddComponent = launchAddComponent;
module.exports.launchBrowsePane = launchBrowsePane;
module.exports.revealAddComponentButton = revealAddComponentButton;
module.exports.addBrowseButton = addBrowseButton;
module.exports.addRemoveButton = addRemoveButton;
module.exports.stripSpaceFromComponentList = stripSpaceFromComponentList;
module.exports.addAvailableSpaces = addAvailableSpaces;
module.exports.updateSelector = updateSelector;