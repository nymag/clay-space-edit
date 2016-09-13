var dom = require('@nymag/dom'),
  _ = require('lodash'),
  references = require('references'),
  utils = require('../services/utils'),
  createService = require('../services/create-service'),
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
    paneContent = utils.createFilterableList(availableComponents, {
      click: this.listItemClick.bind(this),
    });

  references.pane.close();

  references.pane.open([{ header: 'Browse Space', content: paneContent }]);
};

/**
 * [listItemClick description]
 * @param  {string} id
 * @return {Promise}
 */
proto.listItemClick = function (id) {
  return createService.newComponentInLogic(references.getComponentNameFromReference(this.parentRef), id)
    .then(newComponent => {
      var args = {
        ref: newComponent._ref,
        parentField: 'content',
        parentRef: this.parentRef
      };

      return references.edit.addToParentList(args)
        .then(newEl => {
          // insert it at the beginning of the component list
          this.parent.appendChild(newEl);
          return newEl;
        })
        .then(newEl => {
          return references.render.addComponentsHandlers(newEl).then(() => {
            references.focus.unfocus();
            references.select.unselect();
            // Close a pane
            references.pane.close();
            // Invoke callback
            this.callback(newEl);
            // Update the space editing class
            this.makeNewComponentActive(newEl);
            return references.select.select(dom.find(newEl, '[data-uri]'));
          });
        });
    });
};

proto.makeNewComponentActive = function (targetEl) {
  var logics = dom.findAll(this.parent, '.space-logic');

  _.forEach(logics, (logic) => {
    logic.classList.remove(references.spaceEditingClass);
  });

  targetEl.classList.add(references.spaceEditingClass);
};

module.exports = function (spaceParent, callback) {
  return new AddComponent(spaceParent, callback);
};
