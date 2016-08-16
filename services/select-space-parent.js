var _ = require('lodash'),
  dom = require('@nymag/dom'),
  kilnServices = window.kiln.services,
  select = kilnServices.select;

function selectSpaceParent(el, e) {
  var spaceParent = dom.closest(el, '.clay-space');

  // Stop propagation to make sure the child
  // component isn't selected again
  e.stopPropagation();

  // Unselect any currently selected component
  select.unselect();
  // Select the parent
  select.select(spaceParent);
}

module.exports = selectSpaceParent;
