var dom = require('@nymag/dom'),
  _ = require('lodash'),
  kilnServices = window.kiln.services,
  edit = kilnServices.edit,
  spaceName = 'clay-space';

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

  return edit.removeFromParentList(removeOpts)
}


/**
 * [removeIconClick description]
 * @return {[type]} [description]
 */
function removeIconClick(logic) {
  var logicRef = logic.getAttribute('data-uri'),
    index = _.findIndex(this.childrenLogics, function(logicComponent) {
      return logicRef === logicComponent.getAttribute('data-uri');
    });

  removeLogic(logicRef, logic.parentElement)
    .then(findNextActive.bind(this, index));
}

/**
 * [findNextActive description]
 * @param  {[type]} index [description]
 * @param  {[type]} newEl [description]
 * @return {[type]}       [description]
 */
function findNextActive(index, newEl) {
  this.childrenLogics = dom.findAll(this.el, '.space-logic');
  this.findLogicCount();

  if (this.childrenLogics[index]) {
    this.childrenLogics[index].classList.add('space-logic-editing');
  } else if (this.childrenLogics[index - 1]) {
    this.childrenLogics[index - 1].classList.add('space-logic-editing');
  } else {
    console.log('Nothing else in space!');
  }
}

module.exports.removeLogic = removeLogic;
module.exports.removeIconClick = removeIconClick;
