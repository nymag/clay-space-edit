
export function getComponentData(state, ref) {
  return state.components[ref];
}

export function getComponentSchema(state, componentName) {
  return state.schemas[componentName];
}
