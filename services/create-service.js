var dom = require('@nymag/dom'),
  _ = require('lodash'),
  kilnServices = window.kiln.services,
  references = kilnServices.references,
  render = kilnServices.render,
  focus = kilnServices.focus,
  select = kilnServices.select,
  pane = kilnServices.pane,
  progress = kilnServices.progress,
  select = kilnServices.select,
  edit = kilnServices.edit,
  spaceName = 'clay-space';

/**
 * [newComponentInLogic description]
 * @param  {[type]} componentName [description]
 * @return {[type]}               [description]
 */
function newComponentInLogic(componentName) {
  return edit.createComponent(componentName)
    .then(function(component) {
      return edit.createComponent('space-logic', {
        embededComponent: {
          ref: component._ref,
          data: {
            _ref: component._ref
          }
        }
      });
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
 * [findPrevRef description]
 * @param  {[type]} targetComponent [description]
 * @return {[type]}                 [description]
 */
function findPrevRef(targetComponent) {
  var targetRef = targetComponent.getAttribute('data-uri'),
    allComponentsInList = targetComponent.parentElement.children,
    indexOfTarget = null,
    prevRef = '',
    above = false;

    _.forEach(allComponentsInList, function (component, index) {
      if (targetRef === component.getAttribute('data-uri')) {
        indexOfTarget = index;
      }
    });

  if (!indexOfTarget) {
    prevRef = allComponentsInList[indexOfTarget + 1].getAttribute('data-uri');
    above = true;
  } else {
    prevRef = allComponentsInList[indexOfTarget - 1].getAttribute('data-uri');
  }

  return {prevRef: prevRef, above: above};
}

/**
 * [addInSpace description]
 * @param {[type]} options        [description]
 * @param {[type]} parent         [description]
 * @param {[type]} logicComponent [description]
 */
function addInSpace(options, parent, position, logicComponent) {
  return Promise.all([edit.createComponent('clay-space', { content: [{ _ref: logicComponent[references.referenceProperty] }] }), edit.getData(parent.ref)])
    .then(function(promises) {
      var res = promises[0],
        parentRes = promises[1],
        newRef = res._ref,
        args = {
          ref: newRef,
          parentField: parent.path,
          parentRef: parent.ref,
          prevRef: position.prevRef,
          above: position.above
        };

      return edit.addToParentList(args)
        .then(function(newEl) {
          return attachHandlersAndFocus(newEl);
        });
    });
}

/**
 * [createSpace description]
 * @param  {[type]} options [description]
 * @param  {[type]} parent  [description]
 * @param  {[type]} e       [description]
 * @return {[type]}         [description]
 */
function createSpace(options, parent, e) {
  if (!confirmMakeSpace()) {
    return null;
  }

  var clickedComponent = dom.find(parent.el, '[data-uri="' + options.ref + '"]'),
    position = findPrevRef(clickedComponent);

  return wrapInLogic(clickedComponent, options, parent)
    .then(addInSpace.bind(null, options, parent, position))
}

/**
 * [confirmMakeSpace description]
 * @return {[type]} [description]
 */
function confirmMakeSpace() {
  return window.confirm('Do you really want to make a new Space?');
}

/**
 * [attachHandlersAndFocus description]
 * @param  {[type]} el [description]
 * @return {[type]}    [description]
 */
function attachHandlersAndFocus(el) {
  return render.addComponentsHandlers(el).then(function() {
    focus.unfocus();
    select.unselect();
    select.select(el);
    return el;
  });
}

/**
 * [fakeAnAddToComponentList description]
 * @param  {[type]} space          [description]
 * @param  {[type]} componentToAdd [description]
 * @return {[type]}                [description]
 */
function fakeAnAddToComponentList(options, parent, componentToAdd) {
  return Promise.all([edit.createComponent(componentToAdd)])
    .then(function(promises) {
      var res = promises[0],
        newRef = res._ref,
        args = {
          ref: newRef,
          parentField: parent.path,
          parentRef: parent.ref,
          prevRef: options.ref
        };

      return edit.addToParentList(args)
        .then(attachHandlersAndFocus)
        .then(function(el) {
          // Insert the new component
          dom.insertAfter(dom.find(parent.listEl, '[data-uri="' + options.ref + '"]'), el);
          // Close the pane
          pane.close();
        });
    });
}

module.exports.createSpace = createSpace;
module.exports.newComponentInLogic = newComponentInLogic;
module.exports.attachHandlersAndFocus = attachHandlersAndFocus;
module.exports.fakeAnAddToComponentList = fakeAnAddToComponentList;
