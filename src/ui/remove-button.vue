<style lang="sass">
  @import '../styles/_mixins';

  .space-remove-button {
    @include md-button();
  }
</style>


<template>
  <ui-icon-button v-if="shouldDisplay" type="secondary" color="primary" @click.stop="handleClick()" class="quick-bar-button space-remove-button" :tooltip="`Remove Space`" icon="delete">
  </ui-icon-button>
</template>

<script>
import { isSpaceLogic } from '../services/utils';
import icon from './icon.vue';
import { getSpaceElFromLogic } from '../services/utils';
import { removeLogic } from '../services/remove-service';
import _ from 'lodash';

const UiIconButton = window.kiln.utils.components.UiIconButton;

export default {
  name: 'logicRemoveButton',
  data() {
    return {} // eslint-disable-line semi
  },
  computed: {
    /**
     * Grab the length of the content for the Space parent.
     *
     *  @return {Number}
     */
    spaceContentLength() {
      const state = this.$store.state,
        selectionEl = window.kiln.utils.componentElements.getComponentEl(state.ui.currentSelection.uri),
        parentRef = getSpaceElFromLogic(state.site.prefix, selectionEl).getAttribute('data-uri');

      return state.components[parentRef].content.length;
    },
    /**
     * Test if the button should be displayed or not.
     *
     * @return {Boolean}
     */
    shouldDisplay() {
      const isSelected = !_.isUndefined(_.get(this.$store,'state.ui.currentSelection.uri'));

      if (isSelected) {
        return isSpaceLogic(this.$store.state.ui.currentSelection.parentURI);
      }
    }
  },
  methods: {
    // remove the space
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
};
</script>
