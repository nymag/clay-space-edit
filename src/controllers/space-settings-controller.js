var dom = require('@nymag/dom'),
  _ = require('lodash'),
  AddController = require('./add-component-controller'),
  references = require('references'),
  utils = require('../services/utils'),
  removeService = require('../services/remove-service'),
  createService = require('../services/create-service'),
  logicReadoutService = require('../services/logic-readout-service'),
  statusService = require('../services/status-service'),
  proto = BrowseController.prototype;

/**
 * @param {Element} el
 * @param {Object} callbacks
 */
function BrowseController(el, callbacks) {
  /**
   * The Clay Space component data
   * @type {Object}
   */
  this.el = el;

  this.spaceRef = el.getAttribute('data-uri');

  this.callbacks = callbacks;

  /**
   * Children Space Logic componens
   * @type {Array}
   */
  this.childComponents = [];

  /**
   * The list of components in the Space in
   * organized to be used in a filterable list
   * @type {Array}
   */
  this.componentList = [];


  this.findChildrenMakeList(this.el);
  // Launch the pane
  this.launchPane();
}

/**
 * Open the settins pane
 */
proto.launchPane = function () {
  var paneContent = this.markActiveInList(utils.createFilterableList(this.componentList, {
    click: this.listItemClick.bind(this),
    reorder: this.reorder.bind(this),
    settings: this.settings.bind(this),
    remove: this.remove.bind(this),
    add: this.addComponent.bind(this),
    addTitle: 'Add Component To Space'
  }));

  references.pane.open([{ header: this.el.getAttribute(references.dataPaneTitle) || 'Browse Space', content: paneContent }]);
};

/**
 * Launch the AddController
 */
proto.addComponent = function () {
  AddController(this.el, this.callbacks.add);
};

/**
 * [findChildrenMakeList description]
 * @param  {Element} el
 */
proto.findChildrenMakeList = function (el) {
  this.childComponents = utils.findAllLogic(el);
  this.componentList = this.makeList(this.childComponents);
};

/**
 * Apply active styling to the proper item in the filterable list
 * @param  {element} listHtml
 * @returns {element}
 */
proto.markActiveInList = function (listHtml) {
  _.each(this.childComponents, function (logicComponent) {
    if (statusService.isEditing(logicComponent)) {
      dom.find(listHtml, '[data-item-id="' + logicComponent.getAttribute('data-uri') + '"]').classList.add('active');
    }
  });

  return listHtml;
};

/**
 * Delete a component from a space
 *
 * @param  {string} id The `id` value of the item in the filterable list that was clicked
 */
proto.remove = function (id) {
  removeService.removeLogic(id, this.el)
    .then(() => {
      // Make new component list from the returned HTML
      this.findChildrenMakeList(this.el);

      // Invoke the callback
      this.callbacks.remove(this.el);
      // Close the old pane
      references.pane.close();
      // Launch new pane with updated components
      this.launchPane();
    });
};

/**
 * [makeList description]
 * @param  {Array} components
 * @return {Object}
 */
proto.makeList = function (components) {
  return _.map(components, function (item) {
    var childComponent = dom.find(item, '[data-uri]'),
      componentType = references.getComponentNameFromReference(childComponent.getAttribute('data-uri')),
      componentTitle = references.label(componentType),
      readouts = logicReadoutService(item);

    componentTitle = readouts ? componentTitle + readouts : componentTitle;

    return {
      title: componentTitle,
      id: item.getAttribute('data-uri')
    };
  });
};

/**
 * [reorder description]
 * @param  {string} id
 * @param  {number} newIndex
 * @param  {number} oldIndex
 */
proto.reorder = function (id, newIndex, oldIndex) {
  var data = { _ref: this.spaceRef },
    content = _.map(this.componentList, function (item) {
      return { _ref: item.id };
    });

  content.splice(newIndex, 0, content.splice(oldIndex, 1)[0]); // reorder the array
  data.content = content;

  // Save the space
  references.edit.savePartial(data)
    .then((newHtml) => {
      var newChildHtmlPromises;

      // Make new component list from the returned HTML
      this.findChildrenMakeList(newHtml);

      // Make an array of promises for the updated children HTML
      newChildHtmlPromises = _.map(this.childComponents, function (logicComponent) {
        var query = { currentUrl: window.location.href };

        return references.edit.getHTMLWithQuery(logicComponent.getAttribute('data-uri'), query);
      });

      return Promise.all(newChildHtmlPromises)
        .then(this.renderUpdatedSpace.bind(this))
        .then(createService.attachHandlersAndFocus);

    });
};

/**
 * [renderUpdatedSpace description]
 * @param  {Element} resp
 * @return {Element}
 */
proto.renderUpdatedSpace = function (resp) {
  var space = this.el,
    spaceChildren = utils.findAllLogic(this.el),
    spaceOnPage = dom.find(document, '[data-uri="' + this.spaceRef + '"]');

  _.forEach(spaceChildren, function (child) {
    child.parentNode.removeChild(child);
  });

  _.forEach(resp, function (logicComponent) {
    space.appendChild(logicComponent);
  });

  dom.replaceElement(spaceOnPage, space);
  this.findChildrenMakeList(space);

  return space;
};

/**
 * When an item in the browse pane is clicked we want to be able
 * to edit that selected component. Remove the editing attribute
 * from all Logic's and then add it back to the one that was
 * selected. Let's then close the pane and focus on that selected
 * component.
 *
 * @param {string} id
 */
proto.listItemClick = function (id) {
  var newActive = dom.find(this.el, `[data-uri="${id}"]`);

  // Remove editing status from each Logic
  _.each(this.childComponents, function (el) {
    statusService.removeEditing(el);
  });
  // Set the selected Logic to active
  statusService.setEditing(newActive);
  // Close pane
  references.pane.close();
  // Focus on the Logic's embedded component
  references.focus.focus(dom.find(newActive, '[data-uri]'));
};

/**
 * Open the settings window for the logic
 *
 * @param  {string} id
 */
proto.settings = function (id) {
  references.focus.unfocus().then(function () {
    return references.forms.open(id, document.body);
  }).catch(_.noop);
};

/**
 * Make a new Space Settings instance
 *
 * @param  {Object} parent
 * @param  {Object} callbacks
 * @return {BrowseController}
 */
function spaceSettings(parent, callbacks) {
  return new BrowseController(parent, callbacks);
};

module.exports = spaceSettings;

