<style lang="sass">
  @import '../styles/_mixins';

  .create-space-button {
    @include md-button();
  }
</style>

<template>
  <ui-icon-button v-if="shouldDisplay" type="secondary" color="primary" class="quick-bar-button create-space-button" icon="playlist_add" @click.stop="handleClick" :tooltip="`Turn into Space`"></ui-icon-button>
</template>

<script>
import _ from 'lodash';
import { checkIfSpaceEdit, isClaySpace, spaceInComponentList, checkIfSpaceOrLogic } from '../services/utils';
import { createSpace } from '../services/create-service';

const UiIconButton = window.kiln.utils.components.UiIconButton;

export default {
  name: 'createSpaceButton',
  data() {
    return {} // eslint-disable-line semi
  },
  computed: {
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

      parentComponentName = window.kiln.utils.references.getComponentName(currentSelection.parentURI);
      componentListName = currentSelection.parentField.path;

      return _.get(this.$store.state.schemas, `[${parentComponentName}][${componentListName}]`);
    },
    /**
     * Grab the available Spaces. Availability determined by the presence
     * of a component beginning with `clay-space` in the schema for the
     * component
     *
     * @return {Array}
     */
    availableSpaces() {
      return spaceInComponentList(this.componentList, this.$store);
    },
    /**
     * Determine if the button should be displayed
     *
     * @return {Boolean}
     */
    shouldDisplay() {
      const isSelected = !_.isUndefined(_.get(this.$store,'state.ui.currentSelection.uri'));
      var ref;

      if (isSelected) {
        ref = this.$store.state.ui.currentSelection.uri;

        // Check to make sure we:
        // 1) Have Spaces available in the component list
        // 2) We're not dealing with the `clay-space-edit` module
        // 3) We're not dealing with a space component (we don't want to create a
        //    nested Space)

        return this.availableSpaces.length && !checkIfSpaceEdit(ref) && !isClaySpace(ref);
      }
      return false;
    }
  },
  methods: {
    handleClick: function () {
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
  },
  components: {
    UiIconButton
  }
};
</script>
