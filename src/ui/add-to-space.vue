<style lang="sass">

</style>

<template>
  <filterable-list :content="components" @root-action="itemClick"></filterable-list>
</template>

<script>
import { openUI } from '../services/ui-service';
import { addToSpace } from '../services/add-service';
import { setNewActiveLogic } from '../services/toggle-service';

const filterableList = window.kiln.utils.components.filterableList;

export default {
  props: ['data'],
  data() {
    return {} // eslint-disable-line semi
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
     * @param  {String} id
     */
    itemClick(id) {
      const spaceRef = this.data.spaceRef,
        store = this.$store;

      addToSpace(this.$store, spaceRef, id)
        .then(() => openUI(this.$store, spaceRef))
        .then(() => setNewActiveLogic(store, spaceRef));
    }
  },
  components: {
    filterableList
  }
};
</script>
