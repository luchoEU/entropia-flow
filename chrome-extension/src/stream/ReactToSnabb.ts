import { ComponentType, ReactElement } from 'react';
import { VNode, VNodeData, h } from 'snabbdom';

// Function to recursively convert a React element to a Snabbdom VNode
function reactElementToVNode(reactElement: ReactElement): VNode {
  if (typeof reactElement === 'string' || typeof reactElement === 'number') {
    return reactElement;
  }

  const { type, props } = reactElement;
  const children = props.children || [];

  if (typeof type === 'function') {
    // TODO: If it's a functional component, render it and recursively convert the result
    return h('func')
  }

  // Convert props from React to Snabbdom format
  const snabbdomProps: VNodeData = {
    props: { },
    style: props.style
  };
  for (const prop in props) {
    if (prop == 'style') {
        
/*        snabbdomProps[prop] = Object.entries(props[prop])
            .map(([property, value]) => `${property}:${value}`)
            .join(';');*/
    }
    else if (prop !== 'children') {
      snabbdomProps.props[prop] = props[prop];
    }
  }

  // Convert children recursively
  const snabbdomChildren = Array.isArray(children)
    ? children.map(reactElementToVNode)
    : [reactElementToVNode(children)];

  // Create Snabbdom VNode
  return h(type, snabbdomProps, snabbdomChildren);
}

export default reactElementToVNode