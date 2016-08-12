var dom = require('@nymag/dom'),
  _ = require('lodash'),
  kilnServices = window.kiln.services,
  references = kilnServices.references,
  render = kilnServices.render,
  focus = kilnServices.focus,
  select = kilnServices.select,
  progress = kilnServices.progress,
  select = kilnServices.select,
  edit = kilnServices.edit,
  spaceName = 'clay-space';


function newComponentInLogic(componentName) {
  return edit.createComponent(componentName)
    .then(function(component) {
      return edit.createComponent('space-logic', {
        embededComponent: {
          ref: component._ref,
          path: null,
          data: {
            _ref: component._ref
          }
        }
      });
    });
}

/**
 * add a new component to a parent's list
 * @param {object} args
 * @param {Element} pane
 * @param {string} [prevRef]
 * @returns {Promise}
 */
function addToList(args, pane, prevRef) {
  // if we're adding AFTER a component, add that to the arguments
  _.assign(args, { prevRef: prevRef });

  return edit.addToParentList(args)
    .then(function(newEl) {
      dom.find(pane, '.component-list-inner').appendChild(newEl);
      return newEl;
    });
}

/**
 * [wrapInLogic description]
 * @param  {[type]} clickedComponent [description]
 * @param  {[type]} options          [description]
 * @param  {[type]} parent           [description]
 * @return {[type]}                  [description]
 */
function wrapInLogic(clickedComponent, options, parent) {
  return Promise.all([
    edit.createComponent('space-logic', { embededComponent: options }),
    edit.removeFromParentList({ el: clickedComponent, ref: options.ref, parentField: parent.path, parentRef: parent.ref })
  ]).then(function(resp) {
    return resp[0];
  });
}

/**
 * [addInSpace description]
 * @param {[type]} options        [description]
 * @param {[type]} parent         [description]
 * @param {[type]} logicComponent [description]
 */
function addInSpace(options, parent, logicComponent) {
  return Promise.all([edit.createComponent('clay-space', { content: [{ _ref: logicComponent[references.referenceProperty] }] }), edit.getData(parent.ref)])
    .then(function(promises) {
      var res = promises[0],
        parentRes = promises[1],
        newRef = res._ref,
        args = {
          ref: newRef,
          parentField: parent.path,
          parentRef: parent.ref
        };

      return addToList(args, parent.listEl, options.ref)
        .then(function(newEl) {
          return render.addComponentsHandlers(newEl).then(function() {
            focus.unfocus();
            select.unselect();
            progress.done('save');
            return select.select(newEl);
          });
        });
    });
}

function createSpace(options, parent, e) {
  var parentEl = dom.closest(e.target, '[data-uri]');

  wrapInLogic(parentEl, options, parent)
    .then(addInSpace.bind(null, options, parent))
}

module.exports.createSpace = createSpace;
module.exports.newComponentInLogic = newComponentInLogic;
