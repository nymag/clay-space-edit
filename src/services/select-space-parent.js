var dom = require('@nymag/dom'),
  references = require('references');

function selectSpaceParent(el, e) {
  var spaceParent = dom.closest(el, '.clay-space'),
    targetComponent = dom.closest(spaceParent.parentElement, '[data-uri]');

  // Stop propagation to make sure the child
  // component isn't selected again
  e.stopPropagation();

  // Unselect any currently selected component
  references.select.unselect();
  // Select the parent
  references.select.select(targetComponent);
}

module.exports = selectSpaceParent;
