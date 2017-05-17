<template>
  <button v-if="shouldDisplay" class="launch-ui-button" v-on:click="handleClick">
    <span v-html="icon"></span>
    <span>{{ spaceLogicCount }}</span>
  </button>
</template>

<script>
import spaceListIcon from '../../media/list-space.svg';
import dom from '@nymag/dom';

export default {
  data() {
    return {}
  },
  computed: {
    icon() {
      return spaceListIcon;
    },
    spaceParentRef() {
      const spaceEl = dom.closest(this.$store.state.ui.currentSelection.el, `[data-uri^="${this.$store.state.site.prefix}/components/clay-space"]`);

      return spaceEl.getAttribute('data-uri');
    },
    spaceLogicCount() {
      const spaceContent = this.$store.state.components[this.spaceParentRef].content;

      return spaceContent.length
    },
    shouldDisplay() {
      const ref = this.$store.state.ui.currentSelection.parentURI;

      // TODO: Decide if we want to make all components called `space-logic-*`
      return _.includes(ref, 'space-logic');
    }
  },
  methods: {
    handleClick() {
      const paneOptions = {
        position: 'center',
        size: 'large',
        content: {
          component: 'spaces-ui',
          spaceRef: this.spaceParentRef
        },
        name: 'spaces-ui',
        title: 'Some Space Title', // Fill in from Space schema
      };

      return this.$store.dispatch('openPane', paneOptions);
    }
  }
}
</script>
