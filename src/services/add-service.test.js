import { addToSpace, findAvailableComponents} from './add-service.js';
import { kilnApiStub, VuexStoreStub } from '../../test/utils.js';

// importing these other services so we can mock them
import * as createService from './create-service';
import * as utils from './utils';
import * as toggleService from './toggle-service';

describe('add-service', ()=>{
  let dispatchCalls = [], storeStub;
  const spaceRef = '/_components/clay-space/instances/my-space',
    availableComponents = ['related-stories', 'ad', 'most-popular'];

  beforeEach(()=>{
    storeStub = new VuexStoreStub(null, dispatchCalls);
    storeStub.state.components[spaceRef] = {content: [
      {_ref: '/_components/space-logic/instances/space-logic-123'}
    ]};

    createService.findSpaceLogic = jest.fn()
      .mockReturnValue('space-logic');

    utils.getAvailableComponents = jest.fn()
      .mockReturnValue(availableComponents);
    utils.findParentUriAndList = jest.fn()
      .mockReturnValue({el: 'layout', list:'teritary'});

    toggleService.setNewActiveLogic = jest.fn();

    global.kiln = kilnApiStub;
    global.kiln.utils.create.default = jest.fn()
      .mockReturnValue(Promise.resolve(['related-stories']));
    // stubbing an empty object to this Kiln method to prevent errors
    global.kiln.utils.references.getComponentName = jest.fn();

  });

  it('fetch list of components that can be added to a Space', ()=>{
    expect(findAvailableComponents(storeStub, spaceRef)).toBe(availableComponents);
    // make sure we are finding the correct parent
    expect(utils.findParentUriAndList).toBeCalledWith(spaceRef);
  });

  describe('add Space Logic to Space', ()=>{
    it('after adding a new Logic, that logic is set to active', ()=>{
      return addToSpace(storeStub, spaceRef, 'related-stories')
        .then(()=>{
          expect(toggleService.setNewActiveLogic).toBeCalledWith(storeStub, spaceRef);
        });
    });

    it('create a new instance of a Space Logic and add it to the Space', ()=>{
      return addToSpace(storeStub, spaceRef, 'related-stories')
        .then(()=>{
          const testDispatch = dispatchCalls[0];

          expect(testDispatch.type).toBe('addComponents');
          // make sure that we're adding the new Space Logic to the last Space
          // Logic in the Space
          expect(testDispatch.payload.currentURI).toBe('/_components/space-logic/instances/space-logic-123');
          expect(testDispatch.payload.components[0].name).toBe('space-logic');
        });
    });

    it('when adding a component to a Space, a new instances of that components should be created', ()=>{

      return addToSpace(storeStub, spaceRef, 'related-stories')
        .then(()=>{
          const testDispatch = dispatchCalls[0];

          // are we creating the correct component?
          expect(global.kiln.utils.create.default).toBeCalledWith([{name: 'related-stories'}]);
          // ... then are we embedding it into the Space Logic?
          expect(testDispatch.payload.components[0].data).toEqual({
            embeddedComponent: 'related-stories'
          });

        });

    });

  });
});
