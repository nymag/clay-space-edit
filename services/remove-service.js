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
  var targetEl = dom.find(parent.el, '[data-uri="' + ref + '"]'),
    removeOpts = {
      el: targetEl,
      ref: ref,
      parentField: 'content',
      parentRef: parent.ref
    };

  return edit.removeFromParentList(removeOpts)
}

module.exports.removeLogic = removeLogic;
