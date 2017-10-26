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


module.exports = {
  spaceEdit: 'clay-space-edit',
  spacePrefix: 'clay-space',
  dataAvailableSpaces: 'data-spaces-available',
  dataPaneTitle: 'data-space-browse-title',
  addComponent: kilnUtils['add-component'],
  getFromTemplate,
  filterableList: kilnUtils['filterable-list'],
};
