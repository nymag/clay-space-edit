<template>
  <span class="icon" v-html="icon"></span>
</template>

<script>
  import icons from '../services/icons';
  export default {
    props: ['name'],
    data() {
      return {};
    },
    computed: {
      icon() {
        return icons[this.name];
      }
    }
  };
</script>
