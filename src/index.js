var invisibleLists = require('./services/invisible-lists'),
  selectorService = require('./services/selector');

// Load styles
require('./styleguide/styles.scss');

window.kiln = window.kiln || {};
window.kiln.plugins = window.kiln.plugins || {};
window.kiln.plugins['spaces-edit'] = function initSpaces() {
  window.kiln.on('add-selector', selectorService.updateSelector);
  window.kiln.on('component-pane:create-invisible-tab', invisibleLists);
};
