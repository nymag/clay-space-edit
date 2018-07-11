var dom = require('@nymag/dom');

import * as utils from './utils.js';

import * as lib from './remove-service.js';
import { VuexStoreStub } from '../../test/utils.js';

const fakeSpaceUri = '/_components/clay-space/instances/my-space',
  fakeSpaceEl = {
    getAttribute: ()=>fakeSpaceUri
  },
  fakeLogicUri = '/_components/space-logic/instances/space-logic-123',
  fakeLogicEl = {
    getAttribute: ()=>fakeLogicUri
  };

describe('remove-service', ()=>{
  let dispatchCalls, storeStub;

  function mockDependencies() {
    dom = jest.fn();
    dom.find = jest.fn()
      .mockReturnValue(fakeLogicEl);
    // mocking a DOM element object
    utils.getSpaceElFromLogic = jest.fn()
      .mockReturnValue(fakeSpaceEl);
  }


  beforeEach(() => {
    mockDependencies();

    dispatchCalls = [];
    storeStub = new VuexStoreStub(null, dispatchCalls);
    storeStub.state.components[fakeSpaceUri] = { content: [
      {_ref: fakeLogicUri},
      {_ref: '/_components/space-logic/instances/space-logic-345'}
    ]};

  });

  test('remove a Space component given Space Logic', ()=>{
    return lib.removeSpace(storeStub, fakeLogicUri)
      .then(()=>{
        const testDispatch = dispatchCalls[0];

        expect(testDispatch.type).toBe('removeComponent');
        expect(testDispatch.payload).toEqual(fakeSpaceEl);
      });
  });

  test('remove a Space Logic given a Space ref and a Logic ref', ()=>{
    return lib.remove(storeStub, fakeSpaceUri, fakeLogicUri)
      .then(()=>{
        const testDispatch = dispatchCalls[0];

        // check that the Space component is updated
        expect(testDispatch.type).toBe('saveComponent');
        expect(testDispatch.payload.uri).toBe(fakeSpaceUri);
        expect(testDispatch.payload.data.content.includes({_ref:fakeLogicUri})).toBeFalsy();
      });
  });

  // test('remove a Space if its last Space Logic is removed', ()=>{
  //   lib.remove = jest.fn()
  //     .mockReturnValue(Promise.resolve({}));
  //   lib.removeSpace = jest.fn()
  //     .mockReturnValue(Promise.resolve({}));

  //   return lib.removeLogic(storeStub, fakeLogicUri, 1)
  //     .then(()=>{
  //       // expect(lib.remove).toBeCalledWith(storeStub, fakeSpaceUri, fakeLogicUri);
  //       // expect(lib.removeSpace).toBeCalledWith(storeStub, fakeLogicUri);

  //       lib.remove.mockRestore();
  //       lib.removeSpace.mockRestore();
  //     });
  // });

});
