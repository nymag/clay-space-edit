<style lang="sass">
  @import '../styles/_mixins';

  .launch-ui-button {
    @include button();
    position: relative;
    padding: 14px 8px;

    .icon {
      position: relative;
      top: -2px;
    }
  }
</style>

<template>
  <ui-icon-button v-if="shouldDisplay" class="quick-bar-button launch-ui-button" @click.stop="handleClick" :tooltip="`Edit Space`" type="secondary" color="primary">
    <icon name="list-space"></icon>
    <span>{{ spaceLogicCount }}</span>
  </ui-icon-button>
</template>

<script>
import { openUI } from '../services/ui-service';
import icon from './icon.vue';
import { getSpaceElFromLogic } from '../services/utils';
import { get, has, includes, isUndefined} from 'lodash';

const UiIconButton = window.kiln.utils.components.UiIconButton;

export default {
  name: 'UiLaunchButton',
  data() {
    return {} // eslint-disable-line semi
  },
  computed: {
    /**
     * Grab the ref (data-uri) from the closest Space.
     *
     * @return {String}
     */
    spaceParentRef() {
      const selectionUri = this.$store.state.ui.currentSelection.uri,
        selectionEl = window.kiln.utils.componentElements.getComponentEl(selectionUri);

      return getSpaceElFromLogic(this.$store.state.site.prefix, selectionEl).getAttribute('data-uri');
    },
    /**
     * Count the number of items in the `content` array
     *
     * @return {Number}
     */
    spaceLogicCount() {
      const space = get(this.$store.state.components, this.spaceParentRef);

      if (!isUndefined(space) && has(space,'content')) {
        return get(space, 'content').length;
      } else {
        return 0;
      }
    },
    /**
     * Test if the button should be displayed or not. Makes the assumption that
     * the all components related to space-logic are prefixed with 'space-logic'
     *
     * @return {Boolean}
     */
    shouldDisplay() {
      const isSelected = !isUndefined(get(this.$store,'state.ui.currentSelection.uri'));
      let ref;

      if (isSelected) {
        ref = this.$store.state.ui.currentSelection.parentURI;
        return includes(ref, 'space-logic');
      }
    }
  },
  methods: {
    /**
     * Handle button click. Should launch the pane and
     * put the component's Space parent in the store so
     * that the pane can grab data.
     */
    handleClick: function () {
      openUI(this.$store, this.spaceParentRef);
      this.$store.dispatch('unselect');
    }
  },
  components: {
    icon,
    UiIconButton
  }
};
</script>
