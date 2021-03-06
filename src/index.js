// Tracking variables
let activeLogic = undefined,
  spaceEl,
  spaceRef;

// Kiln Mutations
import {
  FOCUS,
  CLOSE_FORM,
  LOADING_SUCCESS
} from './mutationTypes';
import _ from 'lodash';

// Vue Components
import createSpaceButton from './ui/create-space-button.vue';
import UILaunchButton from './ui/ui-launch-button.vue';
import logicRemoveButton from './ui/remove-button.vue';
import spaceUI from './ui/space-ui.vue';
import addToSpace from './ui/add-to-space.vue';

// Internal Services
import { openUI, spaceElFromLogicUri } from './services/ui-service';
import { setAttr, initSpaces} from './services/toggle-service';

// Default styles
require('./styles/defaults.scss');

// Register Selector Buttons
window.kiln.selectorButtons = window.kiln.selectorButtons || {};
window.kiln.selectorButtons.createSpaceButton = createSpaceButton;
window.kiln.selectorButtons.UiLaunchButton = UILaunchButton;
window.kiln.selectorButtons.logicRemoveButton = logicRemoveButton;

// Register Kiln Modals
window.kiln.modals = window.kiln.modals || {};
window.kiln.modals['spaces-ui'] = spaceUI;
window.kiln.modals['add-to-space'] = addToSpace;

// Register Plugins
window.kiln.plugins = window.kiln.plugins || {};
window.kiln.plugins['clay-space-edit'] = function spaceEdit(store) {
  store.subscribe(function spaceEditHandleMutation(mutation) {
    // wrap in a `try` so the UI doesn't stop working entirely
    // if the DOM scraping below doesn't work
    try {
      switch (mutation.type) {
        case FOCUS:
          // Set the logic tracker to true
          activeLogic = _.includes(mutation.payload.uri, 'components/space-logic') ? mutation.payload : undefined;
          break;
        case CLOSE_FORM:
          if (activeLogic) {
            // Select the Space element
            spaceEl = spaceElFromLogicUri(activeLogic.uri);
            spaceRef = spaceEl.getAttribute('data-uri');

            // Make sure the component that was active is displayed
            setAttr(spaceRef, activeLogic.uri);

            // Open the UI pane
            openUI(store, spaceEl.getAttribute('data-uri'));

            // Reset active to undefined
            activeLogic = undefined;
          }
          break;
        case LOADING_SUCCESS:
          // We need to init every Space once Kiln is loaded.
          initSpaces(store);
        default:
          return;
      }
    } catch (err) {
      console.error(err);
    }
  });
};
