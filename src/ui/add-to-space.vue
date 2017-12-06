<style lang="sass">

</style>

<template>
  <filterable-list :content="components" :onClick="itemClick"></filterable-list>
</template>

<script>
import { openUI } from '../services/ui-service';
import { addToSpace } from '../services/add-service';
import { setNewActive } from '../services/toggle-service';

export default {
  props: ['data'],
  data() {
    return {}
  },
  computed: {
    components() {
      return this.data.components;
    }
  },
  methods: {
    /**
     * Click handler for the components in the list
     *
     * @param  {String} value
     */
    itemClick(value) {
      const spaceRef = this.data.spaceRef,
       store = this.$store;

      addToSpace(this.$store, spaceRef, value)
        .then(() => openUI(this.$store, spaceRef))
        .then(() => setNewActive(store, spaceRef));
    }
  }
}
</script>
