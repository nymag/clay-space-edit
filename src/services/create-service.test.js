import { createSpace } from './create-service.js';
import test from 'tape';

test('create-service', t => {

  t.test('createSpace', t => {
    t.test('throws NOT YET IMPLEMENTED on multiple components', t => {
      createSpace(null, '', '', [1, 2])
        .catch(err => {
          t.true(err.message.includes('NOT YET IMPLEMENTED'));
          t.end();
        });
    });


    t.test('throws on schemas that don\'t meet Spaces API', t => {
      const space = 'my-clay-space',
        store = {
          state: {
            schemas: {
              [space]: {
                content: {
                  _componentList: {
                    include: ['somthing else']
                  }
                }
              }
            }
          }
        };

      createSpace(store, '', '', [space])
        .catch(err => {
        // un-comment to see what the error message is
        // t.comment(err.message);
          t.true(err.message.includes('Check the schema.yml'));
          t.end();
          return true;
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
        };

      createSpace(store, ref, parentRef, availableSpaces)
        .then(() => {
        // t.comment(JSON.stringify(dispatchCalls, null, 2));
          t.equal(dispatchCalls.length, 2);
          t.deepEqual(dispatchCalls[0], {
            type: 'addComponents',
            payload: {
              currentURI: ref,
              parentURI: parentRef,
              path,
              components: [{name: space}],
              replace: true
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
