<style lang="sass">
  @import '../styles/_mixins';
  $dragging: #eeeeee;

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
      padding-left: 28px;
      margin: 8px 0 4px;
      font-size: 12px;

      .readouts-item {
        align-items: center;
        display: flex;
        margin-bottom: 2px;
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

      .sortable-chosen {
        /*blue-grey color from KeenUI material design css*/
        background-color: $dragging;
      }
    }

    .ui-icon-button__icon {
      @include button();
    }

    .ui-icon {
      color: #607d8b;
    }

  }
</style>

<template>
  <div class="spaceUI">
    <div class="spaceUI-desc" v-html="spaceDescription">
      <!-- Description is populated here -->
    </div>
    <div class="spaceUI-readout">
      <draggable v-model="spaceContent" element="ul" class="spaceUI-list" ref="list">
        <li class="listItem" v-for="item in spaceContent" icon="settings" @click.stop="setActiveLogic(item)">
          <div class="listItem-main">
            <div class="listItem-main-right">
              <ui-icon icon="drag_handle" type="secondary"></ui-icon>
              <span class="listItem-main-right-name">{{item.componentLabel}}</span>
              <ul class="readouts">
                 <li v-for="readout in item.readouts" class="readouts-item">
                    <div class="readouts-item-icon">
                      <icon :name="validateReadoutIcon(`icon-${readout.icon}`)"></icon>
                    </div>
                    <span class="readout-item-label">{{ readout.label }}:</span> {{readout.value}}
                  </li>
              </ul>
            </div>
          </div>
          <ui-icon-button @click.stop="openTarget(item.logicRef)" icon="gps_fixed" :tooltip="`Edit Logic`" color="clear" type="secondary"></ui-icon-button>
          <ui-icon-button @click.stop="removeFromSpace(item.logicRef)" icon="delete" :tooltip="`Delete Logic`" color="clear" type="secondary"></ui-icon-button>
        </li>
      </draggable>
    </div>
    <ui-button buttonType="button" type="secondary" color="accent" icon="add" @click="addComponent">Add Component to Space</ui-button>
  </div>
</template>

<script>
import { map, filter, find, findIndex, compact, get, has, set } from 'lodash';
import { removeLogic, removeSpace } from '../services/remove-service';
import { openAddComponent } from '../services/ui-service';
import { getActive, setAttr, removeAttr, setNewActive } from '../services/toggle-service';
import { findAvailableComponents, addToSpace } from '../services/add-service';
import icon from './icon.vue';
import allIcons from '../services/icons';
import draggable from 'vuedraggable';

const UiButton = window.kiln.utils.components.UiButton,
  UiIcon = window.kiln.utils.components.UiIcon,
  UiIconButton = window.kiln.utils.components.UiIconButton;


const MAX_PROPERTIES_FOR_READOUT_LABEL = 2,
  acceptedIcons = compact(map(allIcons, function (icon, key) {
    return key.indexOf('icon-') === 0 ? key : null;
  }));

/**
 * map property name to an icon
 * @param {string} propName
 * @returns {string}
 */
function getIcon(propName) {
  const availableIcons = ['time', 'tag'];

  return find(availableIcons, function(icon) {
    return propName.toLowerCase().includes(icon);
  }) || '';
}

export default {
  props: ['data'],
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
    spaceContent: {
      get() {
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
            componentLabel,
            readouts
          };
        });

      return contents;
      },
      set(reordered) {
        const store = this.$store,
          spaceRef = this.spaceRef,
          previousActiveLogic = getActive(this.$store, this.spaceRef);
        // spaceContent is computed from the Space component's content and if we want to
        // save the clay space, we need to do some data munging
        const reorderedSpaceContent = map(reordered, (item) => {
          return { _ref: item.logicRef};
        });

        this.$store.dispatch('saveComponent', { uri: this.spaceRef, data: { content: reorderedSpaceContent }})
          .then(function(){
            const newActiveLogic = getActive(store, spaceRef);

            setAttr(spaceRef, newActiveLogic);
          });
      }
    }
  },
  methods: {
    /**
     * Pretty format a component's name
     * @param  {String} item
     * @return {String}
     */
    componentNameFromLogic(logicData) {
      return window.kiln.utils.label(window.kiln.utils.references.getComponentName(logicData.embeddedComponent._ref));
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
      // assumes all the readouts we'd want are set in the 'settings' group in
      // the schema
      const logicProps = get(logicSchema._groups.settings, 'fields'),
      readoutProps = filter(logicProps, function (val) {
        // remove undefined properties and properties that have Action in their
        // name
        return !!logicData[val] && !val.includes('Action');
      }),
      // if the prop has an associated Action property, create the appropiate
      // readout label
      readouts = map(readoutProps, function (val) {
        let actionProp = val + 'Action',
          label = val;

        if (has(logicSchema, actionProp)) {
          label = logicData[actionProp] + ' ' + val;
        }

        return {
          label: label,
          value: logicData[val],
          icon: getIcon(val)
        };
      });

      return readouts;
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
        console.warn(`Clay Space Logic: icon ${iconName} not found, no icon will be displayed`);

      }
    },
    /**
     * Remove a Logic from a Space
     * @param  {String} uri
     * @return {Promise}
     */
    removeFromSpace(uri) {
      const store = this.$store,
        spaceRef = this.spaceRef;

      removeLogic(this.$store, uri, this.items.length)
        .then(function(){
            setNewActive(store, spaceRef);
        });
    },
    /**
     * Open the settings pane for a Logic
     *
     * @param  {String} uri
     */
    openTarget(uri) {
      const store = this.$store;

      return this.$store.dispatch('closeModal')
        .then(() => store.dispatch('focus', { uri, path: 'settings' }));
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
    },
    setActiveLogic(logic) {
      // set the target logic to active so that the user can edit it
      setAttr(this.spaceRef, logic.logicRef);
      this.$store.dispatch('closeModal');
    }
  },
  components: {
    draggable,
    icon,
    UiButton,
    UiIcon,
    UiIconButton
  }
}
</script>
