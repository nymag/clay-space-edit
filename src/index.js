import {
  SELECT
} from './mutationTypes';
// import invisibleLists from './services/invisible-lists';
import selectorService from './services/selector';
const PLUGIN_NAME = 'spaces-edit';

window.kiln = window.kiln || {};
window.kiln.plugins = window.kiln.plugins || {};

window.kiln.plugins[PLUGIN_NAME] = function spaceEdit(store) {
  store.subscribe(function spaceEditHandleMutation(mutation, state) {
    // wrap in a `try` so the UI doesn't stop working entirely
    // if the code below breaks
    try {
      switch (mutation.type) {
        case SELECT:
          const {
              el,
              parentField,
              parentURI,
              uri
            } = mutation.payload,
            data = state.components[uri],
            layoutData = state.components[parentURI],
            componentListName = parentField.path,
            componentList = layoutData[parentField.path],
            componentListLayout = state.schemas.layout[componentListName];

          if (componentList) {
            selectorService.updateSelector(el, {data, uri}, componentListLayout);
          }
          // TODO: fix implementation of invisibleLists
          // invisibleLists(el);
          break;
        default:
          return;
      }
    } catch (err) {
      console.error(err);
    }
  });
};
