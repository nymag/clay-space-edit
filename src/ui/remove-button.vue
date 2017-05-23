<template>
  <button v-if="shouldDisplay" class="space-remove-button" v-on:click="handleClick" v-html="icon"></button>
</template>

<script>
import { openUI } from '../services/ui-service';
import { checkIfLogic } from '../services/utils';
import removeIcon from '../../media/remove.svg';

export default {
  data() {
    return {}
  },
  computed: {
    icon() {
      return removeIcon;
    },
    /**
     * Test if the button should be displayed or not.
     *
     * @return {Boolean}
     */
    shouldDisplay() {
      return checkIfLogic(this.$store.state.ui.currentSelection.parentURI);
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
      console.log(`womp`);
    }
  }
}
</script>
