window.kiln = window.kiln || {};
window.kiln.utils = window.kiln.utils || {};
const kilnUtils = window.kiln.utils;

/**
 * replacement for kilnUtils.tpl.get
 * Given a CSS selector, returns the result of using
 * the template (from template.hbs) to create a DOM element.
 * If the template is not found, returns `null`.
 * @return {Object | null}
 * @param {String} selector
 */
function getFromTemplate(selector) {
  const el = document.querySelector(selector);

  if (!el || !el.content) {
    throw new Error(`Template for selector ${selector} not found`);
  }

  return document.importNode(el.content, true);
};


// TODO: use ES2015`export`
module.exports = {
  spaceEdit: 'clay-space-edit',
  spacePrefix: 'clay-space',
  dataAvailableSpaces: 'data-spaces-available',
  dataPaneTitle: 'data-space-browse-title',
  render: kilnUtils.render,
  focus: kilnUtils.focus,
  forms: kilnUtils.forms,
  select: kilnUtils.select,
  pane: kilnUtils.pane,
  select: kilnUtils.select,
  edit: kilnUtils.edit,
  label: kilnUtils.label,
  addComponent: kilnUtils['add-component'],
  availableComponents: kilnUtils.getAvailableComponents,
  getFromTemplate,
  filterableList: kilnUtils['filterable-list'],
  site: kilnUtils.site
};
