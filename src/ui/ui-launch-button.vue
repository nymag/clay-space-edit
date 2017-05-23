<template>
  <button v-if="shouldDisplay" class="launch-ui-button" v-on:click="handleClick">
    <span v-html="icon"></span>
    <span>{{ spaceLogicCount }}</span>
  </button>
</template>

<script>
import { openUI } from '../services/ui-service';
import spaceListIcon from '../../media/list-space.svg';
import { getSpaceElFromLogic } from '../services/utils';
import dom from '@nymag/dom';

export default {
  data() {
    return {}
  },
  computed: {
    icon() {
      return spaceListIcon;
    },
    /**
     * Grab the ref (data-uri) from the closest Space.
     *
     * @return {String}
     */
    spaceParentRef() {
      return getSpaceElFromLogic(this.$store.state.site.prefix, this.$store.state.ui.currentSelection.el).getAttribute('data-uri');
    },
    /**
     * Count the number of items in the `content` array
     *
     * @return {Number}
     */
    spaceLogicCount() {
      const spaceContent = this.$store.state.components[this.spaceParentRef].content;

      return spaceContent.length
    },
    /**
     * Test if the button should be displayed or not.
     *
     * @return {Boolean}
     */
    shouldDisplay() {
      const ref = this.$store.state.ui.currentSelection.parentURI;

      // TODO: Decide if we want to make all components called `space-logic-*`
      return _.includes(ref, 'space-logic');
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
    handleClick() {
      openUI(this.$store, this.spaceParentRef);
    }
  }
}
</script>
