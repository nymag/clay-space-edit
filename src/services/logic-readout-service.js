var _ = require('lodash'),
  dom = require('@nymag/dom'),
  references = require('references');

/**
 * Wrap logic groups in a div
 *
 * @param  {string} content
 * @return {string}
 */
function wrapUp(content) {
  if (!content) {
    return '';
  }

  return `<div class="filtered-item-title-logic-readout">${content}</div>`;
}

/**
 * Grab icons, create logic groups
 * @param  {Element} element
 * @param  {String} name
 * @param  {String} value
 * @return {String}
 */
function createReadout(element, name, value) {
  var logicIconSet = references.tpl.get('.clay-space-edit-icons'),
    iconSelector = `.icon-${name.replace('logic', '').toLowerCase()}`,
    icon = dom.find(logicIconSet, iconSelector);

  return `<span class="logic-group">${icon.outerHTML} ${value}</span>`;
}

/**
 * Iterate over all data attributes and create
 * readouts for any prefixed with 'logic'
 *
 * @param  {Element} element
 * @return {String}
 */
function logicReadouts(element) {
  var dataAttributes = element.dataset,
    logicString = '';

  _.forIn(dataAttributes, function (value, key) {
    // Check for logic attributes, but that the full key is not just 'logic'
    if (_.startsWith(key, 'logic') && key !== 'logic') {
      logicString += createReadout(element, key, value);
    }
  });

  return wrapUp(logicString);
}

module.exports = logicReadouts;
