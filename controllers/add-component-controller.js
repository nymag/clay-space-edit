var dom = require('@nymag/dom'),
  _ = require('lodash'),
  createService = require('../services/create-service'),
  kilnServices = window.kiln.services,
  render = kilnServices.render,
  focus = kilnServices.focus,
  select = kilnServices.select,
  select = kilnServices.select,
  edit = kilnServices.edit,
  filterableList = kilnServices['filterable-list'],
  pane = kilnServices.pane,
  editingClass = 'space-logic-editing',
  proto = AddComponent.prototype;


function AddComponent(spaceParent, callback) {
  this.parent = spaceParent;

  this.parentRef = spaceParent.getAttribute('data-uri');

  this.callback = callback;

  this.launchPane();
}

/**
 * Open a pane with with the components available to be
 * added to the Space. This list is derived from the
 * component list of the parent.
 */
proto.launchPane = function () {
  var availableComponents = this.parent.getAttribute('data-components').split(','),
    paneContent = filterableList.create(availableComponents, {
      click: this.listItemClick.bind(this),
    });

  pane.close();

  pane.open([{ header: 'Browse Space', content: paneContent }]);
};

/**
 * [listItemClick description]
 * @param  {string} id
 * @return {Promise}
 */
proto.listItemClick = function (id) {
  return createService.newComponentInLogic(id)
    .then(newComponent => {
      var prevRef = dom.find(this.parent, '.space-logic').getAttribute('data-uri'),
        args = {
          ref: newComponent._ref,
          parentField: 'content',
          parentRef: this.parentRef,
          prevRef: prevRef,
          above: true
        };

      return edit.addToParentList(args)
        .then(newEl => {
          // insert it at the beginning of the component list
          dom.prependChild(this.parent, newEl);
          return newEl;
        })
        .then(newEl => {
          return render.addComponentsHandlers(newEl).then(() => {
            focus.unfocus();
            select.unselect();
            // Close a pane
            pane.close();
            // Invoke callback
            this.callback(newEl);
            // Update the space editing class
            this.makeNewComponentActive(newEl);
            return select.select(dom.find(newEl, '[data-uri]'));
          });
        });
    });
};

proto.makeNewComponentActive = function (targetEl) {
  var logics = dom.findAll(this.parent, '.space-logic');

  _.forEach(logics, (logic) => {
    logic.classList.remove(editingClass);
  });

  targetEl.classList.add(editingClass);
};

module.exports = function (spaceParent, callback) {
  return new AddComponent(spaceParent, callback);
};
