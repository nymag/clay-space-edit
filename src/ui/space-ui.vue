<style lang="sass">
  .spaceUI {
    padding: 17px;
    min-height: 420px; // Resisting a joke.

    .readout-icon {
      display: inline-block;
      min-width: 15px;
      max-height: 15px;
      margin-right: 7px;
    }

    .readout-label {
      vertical-align: top;
    }

    .spaceUI-list {
      list-style: none;
      padding: 0;
      margin: 0;

      .spaceUI-list-item {
        align-items: flex-start;
        display: flex;

        &-main {
          flex-grow: 1;
          flex-shrink: 0;
          padding-top: 10px;
          padding-bottom: 2px;

          &.active {
            border-bottom: 2px solid #229ed3;
          }
        }

        ul.readouts {
          list-style-type: none;
          padding-left: 4px;
          li {
            display: block;
            margin-top: 10px;
            margin-bottom: 10px;
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
          <button>
            <icon name="drag"></icon>
          </button>
          <div class="spaceUI-list-item-main" :class="{ active: item.isActive }">
            <span>{{ item.componentLabel }}</span>
            <ul class="readouts">
              <li v-for="readout in item.readouts">
                <div class="readout-icon">
                  <icon :name="validateReadoutIcon(`icon-${readout.icon}`)"></icon>
                </div>
                <span class="readout-label">{{ readout.label }}</span>
              </li>
            </ul>
          </div>
          <button v-on:click="openTarget(item.logicRef)">
            <icon name="target"></icon>
          </button>
          <button v-on:click="removeFromSpace(item.logicRef)">
            <icon name="remove"></icon>
          </button>
        </li>
      </ul>
      <button type="button" v-on:click="addComponent">Add Component To Space</button>
      <button type="button" v-on:click="render">Render</button>
    </div>
  </div>
</template>

<script>
import { map, assign, filter, findIndex, compact } from 'lodash';
import { removeLogic, removeSpace } from '../services/remove-service';
import { openAddComponent } from '../services/ui-service';
import icon from './icon.vue';
import allIcons from '../services/icons';
import dragula from 'dragula';
import { getComponentName } from '../services/references';
import { findAvailableComponents, addToSpace } from '../services/add-service';

const MAX_PROPERTIES_FOR_READOUT_LABEL = 2,
  utils = window.kiln.utils,
  acceptedIcons = compact(map(allIcons, function (icon, key) {
    return key.indexOf('icon-') === 0 ? key : null;
  }));

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
      const { state } = this.$store,
        components = state.components,
        contents = map(this.items, (item, index) => {
          const logicData = components[item._ref],
            logicName = utils.references.getComponentName(item._ref),
            logicSchema = this.$store.state.schemas[logicName],
            componentLabel = this.componentNameFromLogic(logicData),
            readouts = this.createReadouts(logicData, logicSchema);

          return {
            logicData,
            logicRef: item._ref,
            isActive: false,
            componentLabel,
            readouts
          };
        });

      // active content item is either the first visible item (matching component)
      // or, if no component matches, the first item.
      // The active component is highlighted in the UI
      const activeContent = contents.find(content => content.display)
                            || (contents.length ? contents[0] : null);

      activeContent.isActive = true;

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
    componentNameFromLogic(logicData) {
      return utils.label(utils.references.getComponentName(logicData.component._ref));
    },
    /**
     * Creates readouts for a component. These are shown in the
     * UI to distinguish component instances based on properties
     * identified in the `_targeting` field of the Logic's schema
     *
     * @param {Object} logicData has data for each property in schema `_targeting` field
     * @param {Object} logicSchema with an optional _targeting field
     * @return {Array<Object<String, String>>} {label, icon} for each target
     *
     */
    createReadouts(logicData, logicSchema) {
      const targets = logicSchema['_targeting'] || [];

      return compact(map(targets, function ({ icon, property }) {
        return logicData[property] ? { icon, label: logicData[property] } : null
      }));
    },
    /**
     * Validate that the icon requested is available.
     *
     * @param  {String} iconName
     * @return {String}
     */
    validateReadoutIcon(iconName) {
      if (acceptedIcons.indexOf(iconName) > -1) {
        return iconName;
      } else {
        console.error(`Clay Space Logic: icon ${iconName} not found, no icon will be displayed`);
      }
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
  },
  components: {
    icon
  }
}
</script>
