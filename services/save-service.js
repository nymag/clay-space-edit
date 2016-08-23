var dom = require('@nymag/dom'),
  _ = require('lodash'),
  kilnServices = window.kiln.services,
  edit = kilnServices.edit,
  createService = require('./create-service'),
  selectorService = require('./selector'),
  editingClass = 'space-logic-editing';



function onLogicSave(logic) {

  var targetLogic = dom.find(document, '[data-uri="' + logic._ref + '"]'),
    query = { 'currentUrl': window.location.href };

  return edit.getHTMLWithQuery(logic._ref, query)
    .then(function(html) {
      return createService.attachHandlersAndFocus(html)
        .then(function() {
          var newComponent = dom.find(document, '[data-uri="' + logic._ref + '"]')
          // Replace the targetLogic with the new HTML
          dom.replaceElement(targetLogic, html);
          // TODO: Figure out why adding a class to `html` isn't persisting
          // when the replace is done. Shouldn't need to re-query the DOM
          if (targetLogic.classList.contains(editingClass)) {
            newComponent.classList.add(editingClass);
          }

          var addComponentButton = selectorService.revealAddComponentButton(newComponent);

          this.addButtons();
          addComponentButton.addEventListener('click', selectorService.launchAddComponent.bind(null, newComponent, {ref: this.spaceRef}, this.parent));
        }.bind(this));
    }.bind(this));
}

module.exports = onLogicSave;
