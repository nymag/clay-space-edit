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
 * Launch the controller to browse a Space.
 *
 * @param {Element} el
 * @param {Object}  callbacks
 * @param {Boolean} invisible
 */
function BrowseController(el, callbacks, invisible) {
  /**
   * The Space element
   *
   * @type {Element}
   */
  this.el = el;

  /**
   * The ref to the Space element
   *
   * @type {String}
   */
  this.spaceRef = el.getAttribute(references.referenceAttribute);

  /**
   * An object of callback functions
   *
   * @type {Object}
   */
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

  /**
   * Boolean flag for whether or not you're launching
   * a browse pane for an invisble Space
   *
   * @type {Boolean}
   */
  this.invisible = invisible;

  this.findChildrenMakeList(this.el);
  // Launch the pane
  this.launchPane();
}

/**
 * Open the settings pane
 */
proto.launchPane = function () {
  var paneContent = this.markActiveInList(utils.createFilterableList(this.componentList, {
    click: this.invisible ? _.noop : this.listItemClick.bind(this),
    reorder: this.reorder.bind(this),
    settings: this.settings.bind(this),
    remove: this.remove.bind(this),
    add: this.addComponent.bind(this),
    addTitle: 'Add Component To Space'
  }));

  if (this.invisible) {
    this.addInTarget(paneContent);
  } else {
    this.swapInTargetIcon(paneContent);
  }

  references.pane.open([{ header: this.el.getAttribute(references.dataPaneTitle) || 'Browse Space', content: paneContent }]);
};

/**
 * Add in a separate target button for invisible lists.
 * This is important because the settings still need
 * to point to the original component.
 *
 * @param {Element} content
 */
proto.addInTarget = function (content) {
  var settingsIcons = dom.findAll(content, '.filtered-item-settings'),
    targetSpaceBtn = references.tpl.get('.target-space');

  // Whenever you append a document fragment like `targetSpaceBtn` into the DOM
  // you are taking the content out of the document fragment. If you use `appendChild`
  // then the HTML of the fragment is returned, but since we want to insert this
  // icon before another icon we don't get that benefit. For this reason we have
  // to clone the node (`cloneNode`) so that we can iterate through mutliple and
  // items and apply the button.
  _.forEach(settingsIcons, (icon) => {
    var targetBtn,
      targetSpaceBtnClone = targetSpaceBtn.cloneNode(true);

    // Add in button
    dom.insertBefore(icon, targetSpaceBtnClone);
    // Find the button
    targetBtn = dom.find(icon.parentElement, '.space-target');
    // Attach event listeners
    targetBtn.addEventListener('click', this.targetBtnClick.bind(this));
  });
};

/**
 * Event handler for the target button click event
 *
 * @param  {Object} e
 */
proto.targetBtnClick = function (e) {
  var componentUri = dom.closest(e.target, '[data-item-id]').getAttribute('data-item-id'),
    component = dom.find(`[${references.referenceAttribute}="${componentUri}"]`);

  this.settings(component.parentElement.getAttribute(references.referenceAttribute));
};

/**
 * Replace the settings icon with the target icon because
 * accurate iconography is important
 *
 * @param  {Element} content
 */
proto.swapInTargetIcon = function (content) {
  var settingsBtnSvgs = dom.findAll(content, '.filtered-item-settings svg'),
    targetSvg = references.tpl.get('.target-space-svg');

  _.forEach(settingsBtnSvgs, function (icon) {
    dom.replaceElement(icon, targetSvg.cloneNode(true));
  });
};

/**
 * Launch the AddController
 */
proto.addComponent = function () {
  AddController(this.el, this.callbacks.add, this.invisible);
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
 * Determine if it's the Logic or the child that should be
 * used based on whether or not the Space is invisible
 *
 * @param  {Element} logic
 * @return {Element}
 */
proto.logicOrEmbedded = function (logic) {
  return this.invisible ? dom.find(logic, `[${references.referenceAttribute}]`) : logic;
};

/**
 * Apply active styling to the proper item in the filterable list
 *
 * @param  {element} listHtml
 * @returns {element}
 */
proto.markActiveInList = function (listHtml) {
  if (!this.invisible) { // An 'active' item isn't a thing when you can't see it...right?
    _.each(this.childComponents, (logicComponent) => {
      var targetUri = this.logicOrEmbedded(logicComponent).getAttribute(references.referenceAttribute);

      if (statusService.isEditing(logicComponent)) {
        dom.find(listHtml, `[data-item-id="${targetUri}"]`).classList.add('active');
      }
    });
  }
  return listHtml;
};

proto.logicFromChildRef = function (ref) {
  return dom.closest(dom.find(`[${references.referenceAttribute}="${ref}"]`), '[data-logic]');
};

/**
 * Delete a component from a space
 *
 * @param  {string} id The `id` value of the item in the filterable list that was clicked
 */
proto.remove = function (id) {
  var logicUri = this.invisible ? this.logicFromChildRef(id).getAttribute(references.referenceAttribute) : id;

  removeService.removeLogic(logicUri, this.el)
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
  return _.map(components, (item) => {
    var childComponentUri = dom.find(item, `[${references.referenceAttribute}]`).getAttribute(references.referenceAttribute), // Get the child of the logic
      componentType = references.getComponentNameFromReference(childComponentUri), // Get it's name
      componentTitle = references.label(componentType), // Make the title
      readouts = logicReadoutService(item), // Get logic readouts
      returnId = this.invisible ? childComponentUri : item.getAttribute(references.referenceAttribute);

    componentTitle = readouts ? componentTitle + readouts : componentTitle; // Great the title

    // Return an object representing the Logic and it's child
    return {
      title: componentTitle,
      id: returnId
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
    content = _.map(this.componentList, (item) => {
      var id = item.id;

      // If invisible then `item.id` will be the direct component's
      // uri and not its parent Logic's. Need to fix that.
      if (this.invisible) {
        id = this.logicFromChildRef(id).getAttribute(references.referenceAttribute);
      }

      return { _ref: id };
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

        return references.edit.getHTMLWithQuery(logicComponent.getAttribute(references.referenceAttribute), query);
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
    spaceOnPage = dom.find(document, `[${references.referenceAttribute}="${this.spaceRef}"]`);

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
  var newActive = dom.find(this.el, `[${references.referenceAttribute}="${id}"]`);

  // Remove editing status from each Logic
  _.each(this.childComponents, function (el) {
    statusService.removeEditing(el);
  });
  // Set the selected Logic to active
  statusService.setEditing(newActive);
  // Close pane
  references.pane.close();
  // Focus on the Logic's embedded component
  references.focus.focus(dom.find(newActive, `[${references.referenceAttribute}]`));
};

/**
 * Open the settings window for the logic
 *
 * @param  {string} id
 */
proto.settings = function (id) {
  references.pane.close();
  references.forms.open(id, document.body);
};

/**
 * Make a new Space Settings instance
 *
 * @param  {Object}  el
 * @param  {Object}  callbacks
 * @param  {Boolean} invisible
 * @return {BrowseController}
 */
function spaceSettings(el, callbacks = {}, invisible = false) {
  return new BrowseController(el, callbacks, invisible);
};

module.exports = spaceSettings;

