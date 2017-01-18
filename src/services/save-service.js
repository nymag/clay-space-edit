var dom = require('@nymag/dom'),
  references = require('references'),
  createService = require('./create-service'),
  selectorService = require('./selector'),
  statusService = require('./status-service');

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

          // Add the editing attribute
          statusService.setEditing(newComponent);
          // Was the original component active? Let's make
          // sure the updated one is as well
          if (statusService.isActive(html)) {
            statusService.setActive(newComponent);
          }

          // Close the pane
          references.pane.close();

          // Relaunch the pane
          selectorService.launchBrowsePane(this.el, {
            add: this.onAddCallback.bind(this),
            remove: this.onRemoveCallback.bind(this)
          });
        });
    });
}

/**
 * Runs when a component INSIDE a space-logic component is saved.
 * Once the save is complete, Kiln will add a new selector to that component,
 * which will replace the space selector. So this function re-initializes
 * the space selector.
 */
function onLogicWrappedSave() {
  var handler = () => {
    // "this" is the pre-existing SpaceController instance
    selectorService.updateSelector(this.el, { ref: this.el.getAttribute('data-uri') }, this.parent);
    window.kiln.off('add-selector', handler);
  };

  window.kiln.on('add-selector', handler);
}

module.exports = onLogicSave;
module.exports.onLogicWrappedSave = onLogicWrappedSave;
