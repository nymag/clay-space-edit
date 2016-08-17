var dom = require('@nymag/dom'),
  _ = require('lodash'),
  kilnServices = window.kiln.services,
  edit = kilnServices.edit,
  createService = require('./create-service'),
  editingClass = 'space-logic-editing';



function onLogicSave(logic) {
  var targetLogic = dom.find(document, '[data-uri="' + logic._ref + '"]'),
    query = { 'currentUrl': window.location.href };

  return edit.getHTMLWithQuery(logic._ref, query)
    .then(function(html) {
      return createService.attachHandlersAndFocus(html)
        .then(function() {
          // Replace the targetLogic with the new HTML
          dom.replaceElement(targetLogic, html);
          // TODO: Figure out why adding a class to `html` isn't persisting
          // when the replace is done. Shouldn't need to re-query the DOM
          if (targetLogic.classList.contains(editingClass)) {
            dom.find(document, '[data-uri="' + logic._ref + '"]').classList.add(editingClass);
          }
        });
    });
}

module.exports = onLogicSave;
