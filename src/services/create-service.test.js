import * as utils from './utils.js';
import { createSpace } from './create-service.js';
import test from 'tape';
import sinon from 'sinon';

test('create-service', t => {

  t.test('createSpace', t => {
    t.test('throws NOT YET IMPLEMENTED on multiple components', t => {
      createSpace(null, '', '', [1, 2])
        .catch(err => {
          t.true(err.message.includes('NOT YET IMPLEMENTED'));
          t.end();
        });
    });

    t.test('instantiates logic, embeds component', t => {
      const dispatchCalls = [],
        space = 'my-clay-space',
        spaceLogic = 'my-space-logic',
        path = 'my-path',
        ref = 'ref',
        parentRef = 'parentRef',
        availableSpaces = [space],
        store = {
          state: {
            schemas: {
              [space]: {
                content: {
                  _componentList: {
                    include: [spaceLogic]
                  }
                }
              }
            },
            ui: {
              currentSelection: {
                parentField: {
                  path
                }
              }
            }

          },
          dispatch(type, payload) {
            dispatchCalls.push({type, payload});
            return Promise.resolve({
              dataset: {
                uri: 'ref' + dispatchCalls.length
              }
            });
          }
        },
        // stubs
        stubbedCreateFunction = sinon.stub(window.kiln.utils.create, 'default'),
        stubbedFindSpaceParentUriAndList = sinon.stub(utils,'findSpaceParentUriAndList'),
        stubbedReload = sinon.stub(window.location,'reload');

      stubbedCreateFunction.returns(
        Promise.resolve([
          'alpha',
          'beta'
        ])
      );

      stubbedFindSpaceParentUriAndList.returns(
        {
          el: 'parentEl',
          uri: 'parentUri',
          list: 'list'
        }
      );

      createSpace(store, ref, parentRef, availableSpaces)
        .then(() => {
        // t.comment(JSON.stringify(dispatchCalls, null, 2));
          t.equal(dispatchCalls.length, 1);
          t.deepEqual(dispatchCalls[0], {
            type: 'addComponents',
            payload: {
              parentURI: 'parentRef',
              currentURI: 'ref',
              path: 'list',
              replace: true,
              components: [
                {
                  name: 'my-clay-space',
                  data: {
                    content: [
                      beta
                    ]
                  }
                }
              ]
            }
          });

          // can't check the second call because we're not actually
          // talking to Kiln so Kiln so can't give us a reference to a
          // DOM node
          t.end();
        })
        .catch(err => {
        // t.comment(JSON.stringify(dispatchCalls, null, 2));
          t.fail(err);
          t.end();
        });
    });
  });
  t.end();
});
