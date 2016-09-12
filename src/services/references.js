var _ = require('lodash'),
  referencesObj,
  kilnServices;

window.kiln = window.kiln || {};
window.kiln.services = window.kiln.services || {};
kilnServices = window.kiln.services;

referencesObj = _.assign({
  spaceEdit: 'clay-space-edit',
  spacePrefix: 'clay-space',
  spaceClass: 'clay-space',
  spaceLogicClass: 'space-logic',
  spaceEditingClass: 'space-logic-editing',
  spaceActiveClass: 'space-logic-active',
  dataAvailableSpaces: 'data-spaces-available',
  render: kilnServices.render,
  focus: kilnServices.focus,
  forms: kilnServices.forms,
  select: kilnServices.select,
  pane: kilnServices.pane,
  select: kilnServices.select,
  edit: kilnServices.edit,
  label: kilnServices.label,
  addComponent: kilnServices['add-component'],
  availableComponents: kilnServices.availableComponents,
  tpl: kilnServices.tpl,
  filterableList: kilnServices['filterable-list']
}, kilnServices.references);


module.exports = referencesObj;
