const kilnApiStub = {
    utils: {
      components: {},
      componentElements: {},
      create: {},
      references: {}
    }
  },
  spaceSchema = {
    content:{
      _componentList: {
        include: ['space-logic']
      }
    }
  };


export function VuexStoreStub(uiPath, dispatches) {
  let cmptName, cmptSchema;

  this.dispatch = (type, payload)=>{
    dispatches.push({type, payload});
    return Promise.resolve({});
  };

  this.state = {
    components:{},
    schemas: {
      'clay-space': spaceSchema
    },
    ui: {
      currentSelection: {
        parentField: {
          uiPath
        }
      }
    }
  };
};

module.exports.kilnApiStub = kilnApiStub;
