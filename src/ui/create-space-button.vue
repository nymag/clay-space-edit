<template>
    <button
        v-if="shouldDisplay"
        class="create-space-button yo"
        v-on:click="handleClick"
        v-html="icon">
    </button>
</template>

<script>

  import {
      checkIfSpaceEdit,
      checkIfSpace,
      spaceInComponentList
  } from '../services/utils';
  import {
      createSpace
  } from '../services/create-service';
  import createSpaceIconRaw from '../../media/add-to-space.svg'

  export default {
    data() {
      return {}
    },
    computed: {
        icon() {
            return createSpaceIconRaw;
        },
        componentList() {
            const currentSelection  = this.$store.state.ui.currentSelection,
                componentListName = currentSelection.parentField.path;

            return this.$store.state.schemas.layout[componentListName];
        },
        availableSpaces() {
              return spaceInComponentList(this.componentList);
        },
        shouldDisplay() {
            const ref = this.$store.state.ui.currentSelection.uri;
            return !_.isEmpty(this.componentList)
                    // TODO: understand why doing this
                    // just imitating the logic from before
                    && !checkIfSpaceEdit(ref)
                    && !checkIfSpace(ref);
        }
    },
    methods: {
        handleClick() {
            const store = this.$store,
                { uri: ref, parentURI: parentRef } = this.$store.state.ui.currentSelection;

            // invariant: availableSpaces is non-empty array
            if (!this.availableSpaces || !this.availableSpaces.length) {
                console.error(new Error('This button shouldn\'t be visible when there are no availableSpaces.'));
                return;
            }
            createSpace(store, ref, parentRef, this.availableSpaces);
        }
    }
  }
</script>
