var dom = require('@nymag/dom'),
  _ = require('lodash'),
  createService = require('../services/create-service'),
  kilnServices = window.kiln.services,
  references = kilnServices.references,
  references = kilnServices.references,
  render = kilnServices.render,
  focus = kilnServices.focus,
  select = kilnServices.select,
  progress = kilnServices.progress,
  select = kilnServices.select,
  edit = kilnServices.edit,
  filterableList = kilnServices['filterable-list'],
  pane = kilnServices.pane,
  activeClass = 'space-logic-active',
  spaceName = 'clay-space',
  kilnHide = 'kiln-hide';


function AddComponent(spaceParent) {
  this.parent = spaceParent;

  this.parentRef = spaceParent.getAttribute('data-uri');

  this.launchPane();
}

var proto = AddComponent.prototype;

/**
 * [launchPane description]
 * @return {[type]} [description]
 */
proto.launchPane = function() {
  var availableComponents = this.parent.getAttribute('data-components').split(','),
    paneContent = filterableList.create(availableComponents, {
      click: this.listItemClick.bind(this),
    });
  pane.close();

  pane.open([{ header: 'Browse Space', content: paneContent }]);
}

/**
 * [listItemClick description]
 * @return {[type]} [description]
 */
proto.listItemClick = function(id) {
  createService.newComponentInLogic(id)
    .then(function(newComponent) {
      var prevRef = dom.find(this.parent, '.space-logic').getAttribute('data-uri'),
        args = {
          ref: newComponent._ref,
          parentField: 'content',
          parentRef: this.parentRef,
          prevRef: prevRef,
          above: true
        };

      return edit.addToParentList(args)
        .then(function(newEl) {
          // insert it at the beginning of the component list
          dom.prependChild(this.parent, newEl);
          return newEl;
        }.bind(this))
        .then(function(newEl) {
          return render.addComponentsHandlers(newEl).then(function() {
            this.makeNewComponentActive(newEl);
            focus.unfocus();
            select.unselect();
            pane.close();
            return select.select(dom.find(newEl, '[data-uri]'));
          }.bind(this));
        }.bind(this));
    }.bind(this));
}

proto.makeNewComponentActive = function(targetEl) {
  var logics = dom.findAll(this.parent, '.space-logic');

  _.forEach(logics, function(logic) {
    logic.classList.remove(activeClass);
  });

  targetEl.classList.add(activeClass)
}

module.exports = function(spaceParent) {
  return new AddComponent(spaceParent);
};
