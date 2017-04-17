import {
  SELECT
} from './mutationTypes';
// import invisibleLists from './services/invisible-lists';
import selectorService from './services/selector';
import { closest } from '@nymag/dom';
const PLUGIN_NAME = 'spaces-edit';

window.kiln = window.kiln || {};
window.kiln.plugins = window.kiln.plugins || {};

// TODO: remove this
window.kiln.on = window.kiln.on || function () {};
window.kiln.plugins[PLUGIN_NAME] = function spaceEdit(store) {
  store.subscribe(function spaceEditHandleMutation(mutation, state) {
    // wrap in a `try` so the UI doesn't stop working entirely
    // if the DOM scraping below doesn't work
    try {
      switch (mutation.type) {
        case SELECT:
          const el = mutation.payload,
            ref = el.dataset.uri,
            data = state.components[ref],
            // find the <html> data-layout-uri attribute value
            layoutRef = document.documentElement.dataset.layoutUri,
            layoutData = state.components[layoutRef],
            componentListName = closest(el, '[data-editable]').getAttribute('data-editable'),
            componentList = layoutData[componentListName];

          if (componentList) {
            selectorService.updateSelector(el, {data, ref}, state.schemas.layout[componentListName]);
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
