<style lang="sass">
  .spaceUI {
    padding: 17px;
    min-height: 420px; // Resisting a joke.

    .spaceUI-list {
      list-style: none;
      padding: 0;
      margin: 0;

      .spaceUI-list-item {
        align-items: center;
        display: flex;

        &-name {
          flex-grow: 1;
          flex-shrink: 0;

          &.active {
            border-bottom: 2px solid #229ed3;
          }

        }
      }
    }

    button {
      appearance: none;
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 14px;
      margin: 0;
    }
  }
</style>

<template>
  <div class="spaceUI">
    <div class="spaceUI-desc">
        {{ spaceDescription}}
    </div>
    <div class="spaceUI-readout">
      <ul class="spaceUI-list" ref="list">
        <li v-for="(item, index) in spaceContent" class="spaceUI-list-item" :data-item-id="item.logicRef">
          <button v-html="drag"></button>
          <span class="spaceUI-list-item-name" :class="{ active: item.isActive }">{{ componentName(item) }} -- {{index}}</span>
          <button v-html="target" v-on:click="openTarget(item.logicRef)"></button>
          <button v-html="remove" v-on:click="removeFromSpace(item.logicRef)"></button>
        </li>
      </ul>
      <button type="button" v-on:click="addComponent">Add Component To Space</button>
      <button type="button" v-on:click="render">Render</button>
    </div>
  </div>
</template>

<script>
import { map, assign, filter, findIndex } from 'lodash';
import { removeLogic, removeSpace } from '../services/remove-service';
import { openAddComponent } from '../services/ui-service';
import targetIcon from '../../media/target.svg';
import removeIcon from '../../media/remove.svg';
import dragIcon from '../../media/drag.svg';
import dragula from 'dragula';
import { findAvailableComponents, addToSpace } from '../services/add-service';

const utils = window.kiln.utils;


// Placeholder for Dragula instance
var drag;

/**
 * get index of a child element in a container
 * @param {Element} el
 * @param {Element} container
 * @returns {number}
 */
function getIndex(el, container) {
  return findIndex(container.children, (child) => child === el);
}

/**
 * Add Dragula functionality
 *
 * @param {Element} el
 * @param {Function} reorder
 */
function addDragula(el, reorder) {
  var oldIndex;

  drag = dragula([el], {
    direction: 'vertical'
  });

  drag.on('drag', function (selectedItem, container) {
    oldIndex = getIndex(selectedItem, container);
  });

  drag.on('cancel', function () {
    oldIndex = null;
  });

  drag.on('drop', function (selectedItem, container) {
    reorder(selectedItem.getAttribute('data-item-id'), getIndex(selectedItem, container), oldIndex, selectedItem);
  });
}

export default {
  data() {
    return {};
  },
  computed: {
    spaceName() {
      return this.$store.state.ui.currentPane.content.spaceName;
    },
    spaceRef() {
      return this.$store.state.ui.currentPane.content.spaceRef;
    },
    items() {
      return this.$store.state.components[this.spaceRef].content;
    },
    /**
     * The icon for the target button
     * @return {String}
     */
    target() {
      return targetIcon;
    },
    /**
     * The icon for the remove button
     * @return {String}
     */
    remove() {
      return removeIcon;
    },
    /**
     * The icon for the drag button
     * @return {String}
     */
    drag() {
      return dragIcon;
    },
    /**
     * Grab the description from the schema for the space
     *
     * @return {String}
     */
    spaceDescription() {
      return this.$store.state.schemas[this.spaceName]._description
    },
    /**
     * Compose objects for the UI about the Logic components
     *
     * @return {Array}
     */
    spaceContent() {
      const components = this.$store.state.components,
        contents = map(this.items, (item, index) => {
          const logicData = components[item._ref];

          return {
            logicData,
            logicRef: item._ref,
            isActive: false
          };
        });

      // active content item is either the first visible item (matching component)
      // or, if no component matches, the first item.
      // The active component is highlighted in the UI
      const activeContent = contents.find(content => content.display)
                            || (contents.length ? contents[0] : null);

      if (activeContent) {
        activeContent.isActive = true;
      }

      return contents;

    }
  },
  mounted() {
    // Add dragula
    if (this.items.length > 1) {
      addDragula(this.$refs.list, this.onReorder);
    }
  },
  methods: {
    /**
     * Pretty format a component's name
     * @param  {String} item
     * @return {String}
     */
    componentName(item) {
      return utils.label(utils.references.getComponentName(item.logicData.component._ref));
    },
    /**
     * Remove a Logic from a Space
     * @param  {String} uri
     * @return {Promise}
     */
    removeFromSpace(uri) {
      removeLogic(this.$store, uri, this.items.length)
    },
    /**
     * Open the settings pane for a Logic
     *
     * @param  {String} uri
     */
    openTarget(uri) {
      this.$store.dispatch('closePane');
      this.$store.dispatch('focus', { uri, path: 'settings' });
    },
    /**
     * Re-order Logics in the Space
     *
     * @param  {String} id
     * @param  {Number} index
     * @param  {Number} oldIndex
     */
    onReorder(id, index, oldIndex) {
      var spaceContent = _.cloneDeep(this.items);

      spaceContent.splice(oldIndex, 1); // remove at the old index
      spaceContent.splice(index, 0, { _ref: id }); // add at the new index
      this.$store.dispatch('saveComponent', { uri: this.spaceRef, data: { content: spaceContent }})
    },
    /**
     * TODO: fill in
     */
    addComponent() {
      var components = findAvailableComponents(this.$store, this.spaceRef);

      if (components.length > 1) {
        var componentList = map(components, (cmp) => {
          return {
            id: cmp,
            title: utils.label(cmp)
          };
        });

        openAddComponent(this.$store, this.spaceRef, componentList);
      } else {
        addToSpace(this.$store, this.spaceRef, components[0])
      }
    },
    render() {
      var test = this.$store.state.components[this.spaceRef].content;

      this.$store.commit('RENDER_COMPONENT', {
        uri: this.spaceRef,
        paths: ['content'],
        data: {content: test}
      });
    }
  }
}
</script>
