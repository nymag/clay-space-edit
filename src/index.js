// Kiln Mutations
import {
  FOCUS,
  CLOSE_FORM
} from './mutationTypes';
import { includes } from 'lodash';

// Vue Components
import createSpaceButton from './ui/create-space-button.vue';
import UILaunchButton from './ui/ui-launch-button.vue';
import logicRemoveButton from './ui/remove-button.vue';
import spaceUI from './ui/space-ui.vue';
import addToSpace from './ui/add-to-space.vue';

// Internal Services
import { openUI, spaceElFromLogicUri } from './services/ui-service';

// Selector Buttons
window.kiln.selectorButtons.createSpaceButton = createSpaceButton;
window.kiln.selectorButtons.UILaunchButton = UILaunchButton;
window.kiln.selectorButtons.logicRemoveButton = logicRemoveButton;

// Register Kiln Panes
window.kiln.panes['spaces-ui'] = spaceUI;
window.kiln.panes['add-to-space'] = addToSpace;

/// Main process

// Tracking variables
var activeLogic = undefined

window.kiln.plugins = window.kiln.plugins || {};
window.kiln.plugins['clay-space-edit'] = function spaceEdit(store) {
  store.subscribe(function spaceEditHandleMutation(mutation, state) {
    // wrap in a `try` so the UI doesn't stop working entirely
    // if the DOM scraping below doesn't work
    try {
      switch (mutation.type) {
        case FOCUS:
          // Set the logic tracker to true
          activeLogic = includes(mutation.payload, 'components/space-logic') ? mutation.payload : undefined;
          break;
        case CLOSE_FORM:
          if (activeLogic) {
            var spaceEl = spaceElFromLogicUri(activeLogic);

            openUI(store, spaceEl.getAttribute('data-uri'));
            activeLogic = undefined;
          }
          break;
        default:
          return;
      }
    } catch (err) {
      console.error(err);
    }
  });
};
