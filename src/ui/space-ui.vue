<style lang="sass">
  @import '../styles/_mixins';

  .spaceUI {
    padding: 17px;
    min-height: 420px;

    .spaceUI-desc {
      border-bottom: 1px solid #c3c3c3;
      padding-bottom: 20px;
      margin-bottom: 12px;
    }

    .readouts {
      list-style-type: none;
      padding-left: 4px;
      margin: 8px 0 4px;
      font-size: 12px;
      display: flex;

      > .readouts-item + .readouts-item {
        margin-left: 8px;
      }


      .readouts-item {
        align-items: center;
        display: flex;
      }

      .readouts-item-icon {
        min-width: 15px;
        max-height: 15px;
        margin-right: 7px;
      }
    }

    .spaceUI-list {
      list-style: none;
      padding: 0;
      margin: 0;

      > .listItem + .listItem {
        margin-top: 15px;
      }

      .listItem {
        align-items: flex-start;
        display: flex;

        &.active {
          border-bottom: 2px solid #229ed3;
        }

        &-main {
          align-items: center;
          appearance: none;
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          flex-grow: 1;
          flex-shrink: 0;
          padding: 0;

          &-right {
            text-align: left;

            &-name {
              font-size: 14px;
              margin: 10px 0;
            }
          }
        }
      }
    }

    .uiButton {
      @include button();
    }
  }
</style>

<template>
  <div class="spaceUI">
    <div class="spaceUI-desc" v-html="spaceDescription">
      <!-- Description is populated here -->
    </div>
    <div class="spaceUI-readout">
      <ul class="spaceUI-list" ref="list">
        <li v-for="(item, index) in spaceContent" class="listItem" :data-item-id="item.logicRef" :class="{ active: item.isActive }">
          <button class="listItem-main" v-on:click="itemClick(item.logicRef)">
            <div class="listItem-main-left uiButton" v-if="items.length > 1">
              <icon name="drag"></icon>
            </div>
            <div class="listItem-main-right">
              <span class="listItem-main-right-name">{{ item.componentLabel }}</span>
              <ul class="readouts">
                <li v-for="readout in item.readouts" class="readouts-item">
                  <div class="readouts-item-icon">
                    <icon :name="validateReadoutIcon(`icon-${readout.icon}`)"></icon>
                  </div>
                  <span class="readout-item-label">{{ readout.label }}</span>
                </li>
              </ul>
            </div>
          </button>
          <ui-icon-button v-on:click="openTarget(item.logicRef)" icon="settings" :tooltip="`Edit Logic`"></ui-icon-button>
          <ui-icon-button v-on:click="removeFromSpace(item.logicRef)" icon="delete" :tooltip="`Delete Logic`"></ui-icon-button>
        </li>
      </ul>
      <ui-button buttonType="button" type="secondary" color="accent" icon="add" v-on:click="addComponent">Add Component to Space</ui-button>
    </div>
  </div>
</template>

<script>
import { map, assign, filter, findIndex, compact } from 'lodash';
import { removeLogic, removeSpace } from '../services/remove-service';
import { openAddComponent } from '../services/ui-service';
import { toggle, getActive } from '../services/toggle-service';
import icon from './icon.vue';
import allIcons from '../services/icons';
import dragula from 'dragula';
import { findAvailableComponents, addToSpace } from '../services/add-service';
import { UiButton, UiIconButton } from 'keen-ui';

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
  props: ['data'],
  data() {
    return {
      active: null
    };
  },
  computed: {
    spaceName() {
      return this.data.spaceName;
    },
    spaceRef() {
      return this.data.spaceRef;
    },
    items() {
      return this.$store.state.components[this.data.spaceRef].content;
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
            logicName = window.kiln.utils.references.getComponentName(item._ref),
            logicSchema = this.$store.state.schemas[logicName],
            componentLabel = this.componentNameFromLogic(logicData),
            readouts = this.createReadouts(logicData, logicSchema);

          return {
            logicData,
            logicRef: item._ref,
            isActive: this.active === item._ref,
            componentLabel,
            readouts
          };
        });

      return contents;
    }
  },
  created() {
    this.active = getActive(this.$store, this.spaceRef);
  },
  mounted() {
    // Add dragula
    if (this.items.length > 1) {
      addDragula(this.$refs.list, this.onReorder);
    }
  },
  methods: {
    itemClick(logicRef) {
      this.active = toggle(this.active, logicRef);
    },
    /**
     * Pretty format a component's name
     * @param  {String} item
     * @return {String}
     */
    componentNameFromLogic(logicData) {
      return window.kiln.utils.label(window.kiln.utils.references.getComponentName(logicData.embededComponent.data._ref));
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
      this.$store.dispatch('focus', { uri: uri, path: 'settings' });
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
    * Add a component to the Space
    */
    addComponent() {
      var components = findAvailableComponents(this.$store, this.spaceRef);

      if (components.length === 0) {
        throw new Error(`No components available to add for space:
          ${spaceRef}`)
      }

      if (components.length > 1) {
        var componentList = map(components, (cmp) => {
          // this list will be passed into the filterable-list component and
          // requires each item to have an id and title
          return {
            id: cmp,
            title: window.kiln.utils.label(cmp)
          };
        });

        openAddComponent(this.$store, this.spaceRef, componentList);
      } else {
        addToSpace(this.$store, this.spaceRef, components[0])
      }
    }
  },
  components: {
    icon,
    UiButton,
    UiIconButton
  }
}
</script>
