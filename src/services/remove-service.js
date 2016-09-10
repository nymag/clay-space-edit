var dom = require('@nymag/dom'),
  _ = require('lodash'),
  references = require('references');

/**
 * [removeLogic description]
 * @param  {[type]} ref    [description]
 * @param  {[type]} parent [description]
 * @return {[type]}        [description]
 */
function removeLogic(ref, parent) {
  var targetEl = dom.find(parent, '[data-uri="' + ref + '"]'),
    removeOpts = {
      el: targetEl,
      ref: ref,
      parentField: 'content',
      parentRef: parent.getAttribute('data-uri')
    };

  return references.edit.removeFromParentList(removeOpts);
}

/**
 * [removeSpace description]
 * @param {Element} space
 * @param {Object} parent
 * @return {Promise}
 */
function removeSpace(space, parent) {
  var removeOpts = {
    el: space,
    ref: space.getAttribute('data-uri'),
    parentField: parent.path,
    parentRef: parent.ref
  };

  return references.edit.removeFromParentList(removeOpts);
}


/**
 * [removeIconClick description]
 * @param {Element} logic
 */
function removeIconClick(logic) {
  var logicRef = logic.getAttribute('data-uri'),
    index = _.findIndex(this.childrenLogics, function (logicComponent) {
      return logicRef === logicComponent.getAttribute('data-uri');
    });

  removeLogic(logicRef, logic.parentElement)
    .then(findNextActive.bind(this, index));
}

/**
 * [findNextActive description]
 * @param  {[type]} index [description]
 */
function findNextActive(index) {
  this.childrenLogics = dom.findAll(this.el, '.space-logic');
  this.findLogicCount();

  if (this.childrenLogics[index]) {
    this.childrenLogics[index].classList.add('space-logic-editing');
  } else if (this.childrenLogics[index - 1]) {
    this.childrenLogics[index - 1].classList.add('space-logic-editing');
  } else {
    if (window.confirm('You are removing the last component in this Space, this will remove the Space entirely from the page, is this ok?')) {
      removeSpace(this.el, this.parent);
    }
  }
}

module.exports.removeLogic = removeLogic;
module.exports.removeSpace = removeSpace;
module.exports.removeIconClick = removeIconClick;
