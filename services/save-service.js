var dom = require('@nymag/dom'),
  references = require('references'),
  createService = require('./create-service'),
  selectorService = require('./selector');

function onLogicSave(logic, logicComponent) {
  var query = { currentUrl: window.location.href };

  return references.edit.getHTMLWithQuery(logic._ref, query)
    .then(html => {
      return createService.attachHandlersAndFocus(html)
        .then(() => {
          var newComponent = dom.find(document, `[data-uri="${logic._ref}"]`),
            addComponentButton;

          // Replace the logicComponent with the new HTML
          dom.replaceElement(logicComponent, html);

          // TODO: Figure out why adding a class to `html` isn't persisting
          // when the replace is done. Shouldn't need to re-query the DOM
          addComponentButton = selectorService.revealAddComponentButton(newComponent);

          this.updateChildrenCount()
            .clearEditing()
            .addButtons();

          addComponentButton.addEventListener('click', selectorService.launchAddComponent.bind(null, newComponent, { ref: this.spaceRef }, this.parent));

          newComponent.classList.add(references.spaceEditingClass);
          if (html.classList.contains(references.spaceActiveClass)) {
            newComponent.classList.add(references.spaceActiveClass);
          }

          references.pane.close();

          selectorService.launchBrowsePane(this.el, {
            add: this.onAddCallback.bind(this),
            remove: this.onRemoveCallback.bind(this)
          });
        });
    });
}

module.exports = onLogicSave;
