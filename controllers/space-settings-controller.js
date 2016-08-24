var dom = require('@nymag/dom'),
  _ = require('lodash'),
  AddController = require('./add-component-controller'),
  kilnServices = window.kiln.services,
  references = kilnServices.references,
  pane = kilnServices.pane,
  focus = kilnServices.focus,
  forms = kilnServices.forms,
  label = kilnServices.label,
  edit = kilnServices.edit,
  removeService = require('../services/remove-service'),
  createService = require('../services/create-service'),
  filterableList = kilnServices['filterable-list'],
  editingClass = 'space-logic-editing',
  proto;

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

proto = BrowseController.prototype;

/**
 * Open the settins pane
 */
proto.launchPane = function () {
  var paneContent = this.markActiveInList(filterableList.create(this.componentList, {
    click: this.listItemClick.bind(this),
    reorder: this.reorder.bind(this),
    settings: this.settings.bind(this),
    remove: this.remove.bind(this),
    add: this.addComponent.bind(this),
    addTitle: 'Add Component To Space'
  }));

  pane.open([{ header: 'Match Criteria - Show First Match', content: paneContent }]);
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
  this.childComponents = dom.findAll(el, '.space-logic');
  this.componentList = this.makeList(this.childComponents);
};

/**
 * Apply active styling to the proper item in the filterable list
 * @param  {element} listHtml
 * @returns {element}
 */
proto.markActiveInList = function (listHtml) {
  _.each(this.childComponents, function (logicComponent) {
    if (logicComponent.classList.contains(editingClass)) {
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
    .then(function () {
      // Make new component list from the returned HTML
      this.findChildrenMakeList(this.el);

      // Invoke the callback
      this.callbacks.remove(this.el);
      // Close the old pane
      pane.close();
      // Launch new pane with updated components
      this.launchPane();
    }.bind(this));
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
      componentTitle = label(componentType),
      tags = findTags(item);

    componentTitle = tags ? componentTitle + tags : componentTitle;

    return {
      title: componentTitle,
      id: item.getAttribute('data-uri')
    };
  });
};

/**
 * [findTags description]
 * @param  {[type]} logic
 * @return {[type]}
 */
function findTags(logic) {
  var tags = logic.getAttribute('data-logic-tags');

  if (tags) {
    return '<div class="filtered-item-title-sub">Tags: ' + tags + '</div>';
  } else {
    return '';
  }
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
  edit.savePartial(data)
    .then(function (newHtml) {
      var newChildHtmlPromises;

      // Make new component list from the returned HTML
      this.findChildrenMakeList(newHtml);

      // Make an array of promises for the updated children HTML
      newChildHtmlPromises = _.map(this.childComponents, function (logicComponent) {
        var query = { currentUrl : window.location.href };

        return edit.getHTMLWithQuery(logicComponent.getAttribute('data-uri'), query);
      });

      return Promise.all(newChildHtmlPromises)
        .then(this.renderUpdatedSpace.bind(this))
        .then(createService.attachHandlersAndFocus);

    }.bind(this));
};

/**
 * [renderUpdatedSpace description]
 * @param  {Element} resp
 * @return {Element}
 */
proto.renderUpdatedSpace = function (resp) {
  var space = this.el,
    spaceChildren = dom.findAll(this.el, '.space-logic'),
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
 * [listItemClick description]
 * @param {string} id
 */
proto.listItemClick = function (id) {
  var newActive = dom.find(this.el, '[data-uri="' + id + '"]');

  _.each(this.childComponents, function (el) {
    el.classList.remove(editingClass);
  });

  newActive.classList.add(editingClass);

  pane.close();
};

/**
 * @param  {string} id
 */
proto.settings = function (id) {
  focus.unfocus().then(function () {
    return forms.open(id, document.body);
  }).catch(_.noop);
};

/**
 * [spaceSettings description]
 * @param  {Object} parent
 * @param  {Object} callbacks
 * @return {BrowseController}
 */
function spaceSettings(parent, callbacks) {
  return new BrowseController(parent, callbacks);
};

module.exports = spaceSettings;
