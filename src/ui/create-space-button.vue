<template>
  <button v-if="shouldDisplay" class="create-space-button" v-on:click="handleClick" v-html="icon"></button>
</template>

<script>
import { get } from 'lodash';
import { checkIfSpaceEdit, checkIfSpace, spaceInComponentList, componentNameFromURI, checkIfSpaceOrLogic } from '../services/utils';
import { createSpace } from '../services/create-service';
import createSpaceIconRaw from '../../media/add-to-space.svg'

export default {
  data() {
    return {}
  },
  computed: {
    /**
     * Return the icon HTML
     *
     * @return {String}
     */
    icon() {
      return createSpaceIconRaw;
    },
    /**
     * Get the component list for a componentList
     *
     * @return {Object|Undefined}
     */
    componentList() {
      var currentSelection = this.$store.state.ui.currentSelection,
        parentComponentName, componentListName;

      // Is the parent a Logic or a Space? Get out. Run. Get away, fast.
      if (checkIfSpaceOrLogic(currentSelection.parentURI)) {
        return;
      }

      parentComponentName = componentNameFromURI(currentSelection.parentURI);
      componentListName = currentSelection.parentField.path;

      return get(this.$store.state.schemas, `[${parentComponentName}][${componentListName}]`);
    },
    /**
     * Gran the available Spaces. Availability determined by the presence
     * of a component beginning with `clay-space` in the schema for the
     * component
     *
     * @return {Array}
     */
    availableSpaces() {
      return spaceInComponentList(this.componentList);
    },
    /**
     * Determine if the button should be displayed
     *
     * @return {Boolean}
     */
    shouldDisplay() {
      const ref = this.$store.state.ui.currentSelection.uri;

      // Check to make sure we:
      // 1) Have Spaces available in the component list
      // 2) we're not dealing with the `clay-space-edit` module
      // 3) Check if we're dealing with a Space component
      return this.availableSpaces.length && !checkIfSpaceEdit(ref) && !checkIfSpace(ref);
    }
  },
  methods: {
    handleClick() {
      const store = this.$store,
        {
          uri: ref,
          parentURI: parentRef
        } = this.$store.state.ui.currentSelection;

      // invariant: availableSpaces is non-empty array
      if (!this.availableSpaces || !this.availableSpaces.length) {
        console.error(new Error('This button shouldn\'t be visible when there are no availableSpaces.'));
        return;
      }
      createSpace(store, ref, parentRef, this.availableSpaces);
    }
  }
}
</script>