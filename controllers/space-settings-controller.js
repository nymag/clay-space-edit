var dom = require('@nymag/dom'),
  _ = require('lodash'),
  AddController = require('./add-component-controller'),
  kilnServices = window.kiln.services,
  references = kilnServices.references,
  pane = kilnServices.pane,
  render = kilnServices.render,
  focus = kilnServices.focus,
  select = kilnServices.select,
  forms = kilnServices.forms,
  label = kilnServices.label,
  edit = kilnServices.edit,
  removeService = require('../services/remove-service'),
  filterableList = kilnServices['filterable-list'],
  activeClass = 'space-logic-active',
  editingClass = 'space-logic-editing';

/**
 * [getUpdatedHtml description]
 * @param  {[type]} uri   [description]
 * @param  {[type]} query [description]
 * @return {[type]}       [description]
 */
function getUpdatedHtml(uri, query) {
  return edit.getHTMLWithQuery(uri, query);
}

/**
 * [BrowseController description]
 * @param {[type]} parent  [description]
 * @param {[type]} e       [description]
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

var proto = BrowseController.prototype;

/**
 * [launchPane description]
 * @return {[type]} [description]
 */


proto.launchPane = function() {
  var paneContent = filterableList.create(this.componentList, {
    click: this.listItemClick.bind(this),
    reorder: this.reorder.bind(this),
    settings: this.settings.bind(this),
    remove: this.remove.bind(this),
    add: this.addComponent.bind(this),
    addTitle: 'Add Component To Space'
  });


  pane.open([{ header: 'Match Criteria - Show First Match', content: paneContent }]);
}


proto.addComponent = function() {
  AddController(this.el, this.callbacks.add);
}

/**
 * [reloadComponent description]
 * @return {[type]} [description]
 */
proto.reloadComponent = function(newHtml) {
  return render.reloadComponent(this.spaceRef, newHtml);
}

/**
 * [findChildrenMakeList description]
 * @param  {[type]} parent [description]
 * @return {[type]}        [description]
 */
proto.findChildrenMakeList = function(el) {
  this.childComponents = dom.findAll(el, '.space-logic');
  this.componentList = this.makeList(this.childComponents);
}

/**
 * Delete a component from a space
 *
 * @param  {string} id The `id` value of the item in the filterable list that was clicked
 */
proto.remove = function(id) {
  removeService.removeLogic(id, this.el)
    .then(function(newHtml) {
      // Make new component list from the returned HTML
      this.findChildrenMakeList(newHtml);
      // Close old pane
      pane.close();
      // Launch new pane with updated components
      this.launchPane();

      this.callbacks.remove(newHtml);

      return newHtml;
    }.bind(this))
    .then(this.reloadComponent.bind(this));
}

/**
 * [makeList description]
 * @param  {[type]} components [description]
 * @return {[type]}            [description]
 */
proto.makeList = function(components) {

  return _.map(components, function(item) {
    var childComponent = dom.find(item, '[data-uri]'),
      componentType = references.getComponentNameFromReference(childComponent.getAttribute('data-uri')),
      componentTitle = label(componentType),
      tags = findTags(item);

    if (item.classList.contains(editingClass)) {
      componentTitle = '<span class="filtered-item-title-bold">' + componentTitle + '</span>'
    }

    componentTitle = tags ? componentTitle + tags : componentTitle;

    return {
      title: componentTitle,
      id: item.getAttribute('data-uri')
    }
  });
}

function findTags(logic) {
  var tags = logic.getAttribute('data-logic-tags');

  if (tags) {
    return '<div class="filtered-item-title-sub">Tags: '+ tags + '</div>';
  } else {
    return '';
  }
}

/**
 * [reorder description]
 * @param  {[type]} id       [description]
 * @param  {[type]} newIndex [description]
 * @param  {[type]} oldIndex [description]
 * @return {[type]}          [description]
 */
proto.reorder = function(id, newIndex, oldIndex) {
  var data = { _ref: this.spaceRef },
    content = _.map(this.componentList, function(item) {
      return { _ref: item.id }
    });

  content.splice(newIndex, 0, content.splice(oldIndex, 1)[0]); //reorder the array
  data.content = content;

  // Save the space
  edit.savePartial(data)
    .then(function(newHtml) {
      var logics = dom.findAll(newHtml, '.space-logic'),
        newHtmls = _.map(logics, function(logicComponent) {
          var query = { 'currentUrl': window.location.href };

          return edit.getHTMLWithQuery(logicComponent.getAttribute('data-uri'), query);
        });

      newHtmls.unshift(edit.getHTML(this.spaceRef));

      Promise.all(newHtmls)
        .then(this.renderUpdatedSpace.bind(this))
        .then(function(newEl) {
          return render.addComponentsHandlers(newEl).then(function() {
            focus.unfocus();
            select.unselect();
            return select.select(newEl);
          });
        });

    }.bind(this));
}

/**
 * [renderUpdatedSpace description]
 * @param  {[type]} resp [description]
 * @return {[type]}      [description]
 */
proto.renderUpdatedSpace = function(resp) {
  var space = resp.shift(),
    spaceChildren = dom.findAll(space, '.space-logic'),
    spaceOnPage = dom.find(document, '[data-uri="' + space.getAttribute('data-uri') + '"]');

  _.forEach(spaceChildren, function(child) {
    child.parentNode.removeChild(child);
  });

  _.forEach(resp, function(logicComponent) {
    space.appendChild(logicComponent);
  });

  dom.replaceElement(spaceOnPage, space);
  this.findChildrenMakeList(space);

  return space;
}

/**
 * [listItemClick description]
 * @return {[type]} [description]
 */
proto.listItemClick = function(id) {
  var newActive = dom.find(this.el, '[data-uri="' + id + '"]');

  _.each(this.childComponents, function(el) {
    el.classList.remove(activeClass, editingClass);
  });

  newActive.classList.add(activeClass, editingClass);

  pane.close();
}

/**
 * [settings description]
 * @param  {[type]} id [description]
 * @return {[type]}    [description]
 */
proto.settings = function(id) {
  focus.unfocus().then(function() {
    return forms.open(id, document.body);
  }).catch(_.noop);
}

/**
 * [spaceSettings description]
 * @param  {[type]} options [description]
 * @param  {[type]} parent  [description]
 * @param  {[type]} e       [description]
 * @return {[type]}         [description]
 */
function spaceSettings(parent, callbacks) {
  return new BrowseController(parent, callbacks);
}

module.exports = spaceSettings;
