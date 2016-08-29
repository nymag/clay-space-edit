var _ = require('lodash'),
  referencesObj;

window.kiln = window.kiln || {};
window.kiln.services = window.kiln.services || {};

referencesObj = _.assign({
  spaceClass: 'clay-space',
  spaceEditingClass: 'space-logic-editing',
  spaceActiveClass: 'space-logic-active',
  render: window.kiln.services.render,
  focus: window.kiln.services.focus,
  forms: window.kiln.services.forms,
  select: window.kiln.services.select,
  pane: window.kiln.services.pane,
  select: window.kiln.services.select,
  edit: window.kiln.services.edit,
  label: window.kiln.services.label,
  addComponent: window.kiln.services['add-component'],
  availableComponents: window.kiln.services.availableComponents,
  tpl: window.kiln.services.tpl,
  filterableList: window.kiln.services['filterable-list']
}, window.kiln.services.references);


module.exports = referencesObj;
