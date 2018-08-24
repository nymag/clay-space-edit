var dom = require('@nymag/dom');

// Mock DOM elements
const mockSpaceElements = [
  {getAttribute: ()=>'/_components/clay-space/instances/cjfb7nklu000w3i5xzvizb72e'},
  {getAttribute: ()=>'/_components/clay-space/instances/cjfjy3tdh000p3i5zg3gaubli'},
  {getAttribute: ()=>'/_components/clay-space/instances/cjgpep0we000v3i5zgolixf2u'},
];

import * as lib from './toggle-service.js';
import { VuexStoreStub } from '../../test/utils.js';

describe('toggle-service', ()=>{
  let storeStub, dispatchCalls;

  function mockDependencies() {
    dom = jest.fn();
    dom.find = jest.fn();
  };

  beforeEach(()=>{
    mockDependencies();
    storeStub = new VuexStoreStub();
    dispatchCalls = [];
  });

  // TODO: these tests are WIP

  // it('if there is more than one active Logic, only the first one should be displayed and the rest are hidden', () => {
  // });

  // it('if a Space has no Logic, a warning should be thrown', () => {

  // });

  // it('if there is no active Logic, the first one is displayed', () => {

  // });

  // it('if there is more than one active Logic, all Logics except for the first one are hidden', ()=>{

  // });

  it("remove 'data-logic-active' attribute from Space Logic DOM El", ()=>{
    let $mockLogicEl = {};

    $mockLogicEl.removeAttribute = jest.fn();

    lib.removeAttr($mockLogicEl);

    expect($mockLogicEl.removeAttribute).toBeCalledWith('data-logic-active');
  });

  afterEach(()=>{
    dom.mockReset();
  });

});
