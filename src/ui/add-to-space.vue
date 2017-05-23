<style lang="sass">

</style>

<template>
  <filterable-list :content="components" :onClick="itemClick"></filterable-list>
</template>

<script>
import { openUI } from '../services/ui-service';
import { addToSpace } from '../services/add-service';

export default {
  data() {
    return {}
  },
  computed: {
    components() {
      return this.$store.state.ui.currentPane.content.components;
    }
  },
  methods: {
    /**
     * Click handler for the components in the list
     *
     * @param  {String} value
     */
    itemClick(value) {
      const spaceRef = this.$store.state.ui.currentPane.content.spaceRef;

      addToSpace(this.$store, spaceRef, value)
        .then(() => openUI(this.$store, spaceRef));
    }
  },
  components: {
    'filterable-list': window.kiln.panes['filterable-list']
  }
}
</script>
