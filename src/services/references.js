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
  dataAvailableSpaces: 'data-spaces-available',
  dataPaneTitle: 'data-space-browse-title',
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
  filterableList: kilnServices['filterable-list'],
  site: kilnServices.site
}, kilnServices.references);


module.exports = referencesObj;
