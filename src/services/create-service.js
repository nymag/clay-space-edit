var dom = require('@nymag/dom'),
  _ = require('lodash'),
  references = require('references'),
  utils = require('./utils');

/**
 * Take the name of the Space and the desired component to be created
 * and wrap that component in a Logic and add to the Space. The Space
 * name is needed because we do a lookup in the schema to see which
 * logic is available to it.
 *
 * @param  {String} spaceName     Name of the Space component is going in
 * @param  {String} componentName Name of the component to create
 * @return {Promise}
 */
function newComponentInLogic(spaceName, componentName) {
  return findSpaceLogic(spaceName)
    .then(function (logicComponent) {
      return references.edit.createComponent(componentName)
        .then(function (component) {
          return references.edit.createComponent(logicComponent, {
            embededComponent: {
              ref: component._ref,
              data: {
                _ref: component._ref
              }
            }
          });
        });
    });
}

/**
 * Take a component, wrap it in a Logic component, and then return
 * the Logic component's data.
 *
 * @param  {String}  logicComponent   The name of the logic component
 * @param  {Element} clickedComponent The element that was clicked to create the space
 * @param  {Object}  options          Component options
 * @param  {Object}  parent           Parent component
 * @return {Promise}
 */
function wrapInLogic(logicComponent, clickedComponent, options, parent) {
  return Promise.all([
    references.edit.createComponent(logicComponent, { embededComponent: options }),
    references.edit.removeFromParentList({ el: clickedComponent, ref: options.ref, parentField: parent.path, parentRef: parent.ref })
  ]).then(function (resp) {
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

  return { prevRef: prevRef, above: above };
}

/**
 * At this stage the component has already been wrapped in newly created
 * Logic component. This function then creats a Space per the user's
 * selection and adds that Logic to the Space and adds the Space to the
 * componentList of the original component.
 *
 * @param {String} space
 * @param {Object} options
 * @param {Object} parent
 * @param {Object} position
 * @param {Object} logicComponent
 * @return {Promise}
 */
function addInSpace(space, options, parent, position, logicComponent) {
  return Promise.all([references.edit.createComponent(space, { content: [{ _ref: logicComponent[references.referenceProperty] }] }), references.edit.getData(parent.ref)])
    .then(function (promises) {
      var res = promises[0],
        newRef = res._ref,
        args = {
          ref: newRef,
          parentField: parent.path,
          parentRef: parent.ref,
          prevRef: position.prevRef,
          above: position.above
        };

      return references.edit.addToParentList(args)
        .then(function (newEl) {
          return attachHandlersAndFocus(newEl);
        });
    });
}

/**
 * Find the component to convert to a Space, find the Spaces available
 * in the parent's component list, figure out which Space needs to be
 * created, make it happen.
 *
 * @param  {Object} options
 * @param  {Object} parent
 * @return {Promise}
 */
function createSpace(options, parent) {
  var clickedComponent = dom.find(parent.el, '[data-uri="' + options.ref + '"]'),
    availableSpaces = utils.availableSpaces(clickedComponent);

  if (availableSpaces.length > 1) {
    selectSpace(availableSpaces, clickedComponent, options, parent);
  } else {
    if (!confirmMakeSpace()) {
      return;
    }
    return componentToSpace(clickedComponent, options, parent, availableSpaces[0]);
  }
}

/**
 * Prompt the user to see if they're sure they want to make a Space.
 *
 * @return {Boolean}
 */
function confirmMakeSpace() {
  return window.confirm('Do you really want to make a new Space?');
}

/**
 * If there is more than one type of Space available in a
 * component list then open a pane to allow the user to choose
 * which Space they want
 *
 * @param {Array}   availableSpaces
 * @param {Element} clickedComponent
 * @param {Object}  options
 * @param {Object}  parent
 */
function selectSpace(availableSpaces, clickedComponent, options, parent) {
  references.pane.open([{
    header: 'Choose A Space',
    content: utils.createFilterableList(availableSpaces, {
      click: spaceSelectCallback.bind(null, clickedComponent, options, parent)
    })
  }]);
}

/**
 * Callback function when a user selects which Space to create.
 * Close the pane, kick off the process.
 *
 * @param  {Element} clickedComponent
 * @param  {Object}  options
 * @param  {Object}  parent
 * @param  {String}  id
 * @return {Promise}
 */
function spaceSelectCallback(clickedComponent, options, parent, id) {
  if (!confirmMakeSpace()) {
    return;
  }

  references.pane.close();

  return componentToSpace(clickedComponent, options, parent, id);
}

/**
 * Grab the schema for whatever Space component is selected and
 * find the Logic component available to it.
 *
 * @param  {String} space  The component name
 * @return {Promise}
 */
function findSpaceLogic(space) {
  return references.edit.getSchema(`${references.site.get('prefix')}/components/${space}`)
    .then(function (resp) {
      var componentList = _.get(resp, 'content._componentList.include', '') || _.get(resp, 'prop._componentList.include', '');

      if (componentList && componentList.length === 1) {
        return componentList[0];
      } else if (componentList && componentList.length > 1) {
        throw new Error('A Logic componentList can only have 1 component (for now....)');
      }
    });
}

/**
 * Create a componenet wrapped in a Logic which is inside of a
 * component list in a Space
 *
 * @param  {Element} clickedComponent
 * @param  {Object}  options
 * @param  {Object}  parent
 * @param  {String}  space
 * @return {Promise}
 */
function componentToSpace(clickedComponent, options, parent, space) {
  var position = findPrevRef(clickedComponent);

  return findSpaceLogic(space)
    .then(function (logicComponent) {
      return wrapInLogic(logicComponent, clickedComponent, options, parent)
        .then(addInSpace.bind(null, space, options, parent, position));
    });
}

/**
 * [attachHandlersAndFocus description]
 * @param  {[type]} el [description]
 * @return {[type]}    [description]
 */
function attachHandlersAndFocus(el) {
  return references.render.addComponentsHandlers(el).then(function () {
    references.focus.unfocus();
    references.select.unselect();
    references.select.select(el);
    return el;
  });
}

/**
 * [fakeAnAddToComponentList description]
 * @param  {Object} options
 * @param  {Object} parent
 * @param  {String} componentToAdd
 * @return {Promise}
 */
function fakeAnAddToComponentList(options, parent, componentToAdd) {
  return references.addComponent(parent.listEl, parent, componentToAdd, options.ref)
    .then(function () {
      references.pane.close();
    });
}

module.exports.createSpace = createSpace;
module.exports.newComponentInLogic = newComponentInLogic;
module.exports.attachHandlersAndFocus = attachHandlersAndFocus;
module.exports.fakeAnAddToComponentList = fakeAnAddToComponentList;

