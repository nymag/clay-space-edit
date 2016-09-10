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

/**
 * TODO: Investigate a way around this hack. Whenever a form closes
 * it fires the `form:close` event which then refreshes a component's content.
 * This is cool unless you want that component to have buttons on the selector
 * AND you need it to retain a reference to a controller. Because of that we
 * use `setTimeout` to throw this function to the end of the event queue so that
 * it will run after the `form:close` event is fired and keep all our references.
 * So yeah, this might cause a memory leak....?
 * @param  {Element} element
 */
function onLogicWrappedSave(element) {
  setTimeout(function () {
    var onPageElement = dom.find(`[data-uri="${element.getAttribute('data-uri')}"]`);

    dom.replaceElement(onPageElement, element);
  }, 0);
}

module.exports = onLogicSave;
module.exports.onLogicWrappedSave = onLogicWrappedSave;
