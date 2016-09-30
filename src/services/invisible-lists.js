var dom = require('@nymag/dom'),
  _ = require('lodash'),
  createService = require('./create-service'),
  removeService = require('./remove-service'),
  references = require('references'),
  utils = require('./utils'),
  SpaceSettings = require('../controllers/space-settings-controller'),
  settingsCallbacks = {
    remove: removeCallback
  };

/**
 * Modify the HTML of an invisible component list
 * tab to include anything related to Spaces
 *
 * @param  {Element} invisibleList
 */
function openInvisibleList(invisibleList) {
  var spaceableElements = dom.findAll(invisibleList.list.el, `[${references.dataAvailableSpaces}]`),
    spaceableRefs = _.compact(_.map(spaceableElements, function (element) {
      var uri = element.getAttribute(references.referenceAttribute);

      return _.includes(uri, references.spacePrefix) ? null : uri;
    })),
    listItemElements = dom.findAll(invisibleList.content, '[data-item-id]'),
    spaceComponents = _.filter(listItemElements, function (el) {
      var itemId = el.getAttribute('data-item-id');

      return _.includes(itemId, references.spacePrefix) && !_.includes(itemId, references.spaceEdit);
    });

  _.forEach(filterListItems(spaceableRefs, listItemElements), addCreateButton.bind(null, invisibleList));
  _.forEach(spaceComponents, addBrowseButton);
}

/**
 * Find all the list items in the filterable list
 * that can be made into a Space
 *
 * @param  {Array} targetRefs
 * @param  {Element} items
 * @return {Array}
 */
function filterListItems(targetRefs, items) {
  return _.filter(items, function (item) {
    return _.includes(targetRefs, item.getAttribute('data-item-id'));
  });
}

/**
 * Add in the 'Create Space' button
 * @param {Object} invisibleList
 * @param {Element} item
 */
function addCreateButton(invisibleList, item) {
  var settings = dom.find(item, '.filtered-item-settings'),
    createSpaceButton = references.tpl.get('.create-space-list'),
    createButton;

  dom.insertBefore(settings, createSpaceButton);

  createButton = dom.find(item, '.space-create');
  createButton.addEventListener('click', createSpaceFromInvisibleComponent.bind(null, item, invisibleList));
}

/**
 * Create a Space out of the invisible component
 *
 * @param  {Element} item
 * @param  {Object} invisibleList
 */
function createSpaceFromInvisibleComponent(item, invisibleList) {
  var uri = item.getAttribute('data-item-id'),
    element = dom.find(document, `[data-uri="${uri}"]`),
    parent = dom.closest(element.parentElement, '[data-uri]');

  createService.createSpace({ ref: uri, data: { _ref: uri } }, {
    el: parent,
    ref: invisibleList.layoutRef,
    path: invisibleList.list.path
  });
}

/**
 * Add in the proper browse button
 *
 * @param {Element} item
 */
function addBrowseButton(item) {
  var settings = dom.find(item, '.filtered-item-settings'),
    remove = dom.find(item, '.filtered-item-remove'),
    spaceUri = item.getAttribute('data-item-id'),
    spaceElement = dom.find(document, `[data-uri="${spaceUri}"]`),
    browseSpaceButton = references.tpl.get('.browse-space-list'),
    browseButton;

  dom.insertBefore(settings, browseSpaceButton);
  settings.classList.add('kiln-hide');
  remove.classList.add('kiln-hide');
  // Find the browse button
  browseButton = dom.find(item, '.space-browse');
  // Add count of elements
  getBrowseCount(spaceElement, browseButton);
  // Create the browse pane
  browseButton.addEventListener('click', function () {
    launchBrowse(spaceElement);
  });
};

/**
 * Open the browse pane for a Space
 *
 * @param  {Element} spaceElement
 */
function launchBrowse(spaceElement) {
  SpaceSettings(spaceElement, settingsCallbacks, true);
}

/**
 * The callback function when a component is removed.
 * Either remove the Logic and re-open the pane or
 * remove the whole Space
 *
 * @param  {Element} space
 */
function removeCallback(space) {
  var logics = utils.findAllLogic(space),
    parentPath;

  if (logics.length) {
    launchBrowse(space);
  } else {
    parentPath = dom.closest(space, '[data-editable]').getAttribute('data-editable');
    references.edit.getLayout()
      .then(function (data) {
        references.pane.close();
        return removeService.removeSpace(space, { ref: data, path: parentPath });
      });
  }
}

/**
 * Add the count to the browse button
 *
 * @param  {Element} spaceElement
 * @param  {Element} button
 */
function getBrowseCount(spaceElement, button) {
  var count = dom.find(button, '.logic-count');

  count.innerHTML = dom.findAll(spaceElement, '[data-logic]').length;
}

module.exports = openInvisibleList;
