import * as utils from './utils.js';
import { createSpace, findSpaceLogic } from './create-service.js';
import { kilnApiStub, VuexStoreStub } from '../../test/utils.js';

describe('create-service', () => {
  const spaceParentRef = '/_components/layout/instances/article',
    spaceRef = '/_components/clay-space/instances/my-space',
    logicRef = '/_components/space-logic/instances/my-logic';

  let dispatchCalls = [], storeStub;

  describe('create space', () => {
    beforeEach(() => {
      storeStub = new VuexStoreStub(null, dispatchCalls);
      // in Jest, the window object can be stubbed via global
      global.location.reload = jest.fn();
      global.kiln = kilnApiStub;
      global.kiln.utils.create.default = jest.fn().mockReturnValue(
        Promise.resolve(['my-space','new-space-logic'])
      );
    });

    afterEach(() => {
      dispatchCalls = [];
    });

    test('NOT YET IMPLEMENTED error is thrown when attempting to create a Space within a Space', ()=>{
      const availableSpaces = ['clay-space', 'clay-space-ads'];

      return createSpace(storeStub, spaceRef, spaceParentRef, availableSpaces)
        .catch(err => {
          expect(err.message).toBe('create space with multiple spaces available NOT YET IMPLEMENTED');
        });
    });

    test('create a new Space with a Space Logic with the correct component embedded in it', ()=> {
      const availableSpaces = ['clay-space'];

      utils.findParentUriAndList = jest.fn()
        .mockReturnValue({
          el: 'parentEl',
          uri: 'parentUri',
          list: 'list'
        });

      return createSpace(storeStub, spaceRef, spaceParentRef, availableSpaces)
        .then(()=>{
          const addComponentVueEvent = dispatchCalls[0];

          expect(global.kiln.utils.create.default.mock.calls.length).toBe(1);
          expect(addComponentVueEvent.type).toBe('addComponents');
          expect(addComponentVueEvent.payload).toEqual({
            parentURI: spaceParentRef,
            currentURI: spaceRef,
            path: 'list',
            replace: true,
            components: [
              {
                name: 'clay-space',
                data: {
                  content: ['new-space-logic']
                }
              }
            ]
          });
        });
    });

    test('when a new Space is created, the page should be refreshed', ()=>{
      const availableSpaces = ['clay-space'];

      return createSpace(storeStub, spaceRef, spaceParentRef, availableSpaces)
        .then(()=>{
          expect(global.location.reload.mock.calls.length).toBe(1);
        });
    });
  });

  describe('find space logic', () => {
    test('find Space logics that are in a Space', ()=>{
      expect(findSpaceLogic(storeStub, 'clay-space')).toBe('space-logic');
    });
  });
});
