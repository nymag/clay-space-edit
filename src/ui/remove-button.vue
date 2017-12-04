<style lang="sass">
  @import '../styles/_mixins';

  .space-remove-button {
    @include button();
  }
</style>


<template>
  <ui-icon-button v-if="shouldDisplay" @click.stop="handleClick" class="space-remove-button" :tooltip="`Remove Space`" color="clear" icon="delete" type="secondary">
  </ui-icon-button>
</template>

<script>
import { openUI } from '../services/ui-service';
import { checkIfLogic } from '../services/utils';
import icon from './icon.vue';
import { getSpaceElFromLogic } from '../services/utils';
import { removeLogic } from '../services/remove-service';
import { get, isUndefined } from 'lodash';

const UiIconButton = window.kiln.utils.components.UiIconButton;

export default {
  name: 'logicRemoveButton',
  data() {
    return {}
  },
  computed: {
    /**
     * Grab the length of the content for the Space parent.
     *
     *  @return {Number}
     */
    spaceContentLength() {
      const state = this.$store.state,
        parentRef = getSpaceElFromLogic(state.site.prefix, state.ui.currentSelection.el).getAttribute('data-uri');

      return state.components[parentRef].content.length;
    },
    /**
     * Test if the button should be displayed or not.
     *
     * @return {Boolean}
     */
    shouldDisplay() {
      const isSelected = !isUndefined(get(this.$store,'state.ui.currentSelection.uri'));

      if (isSelected) {
        return checkIfLogic(this.$store.state.ui.currentSelection.parentURI);
      }
    }
  },
  methods: {
    /**
     * Handle button click. Should launch the pane and
     * put the component's Space parent in the store so
     * that the pane can grab data.
     *
     * @return {Promise} [description]
     */
    handleClick: function () {
      const logicUri = this.$store.state.ui.currentSelection.parentURI;

      removeLogic(this.$store, logicUri, this.spaceContentLength)
        .then(() => this.$store.dispatch('unselect'));
    }
  },
  components: {
    icon,
    UiIconButton
  }
}
</script>
