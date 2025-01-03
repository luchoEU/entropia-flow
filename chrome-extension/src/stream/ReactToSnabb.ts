import { JSX } from 'react';
import { VNode, VNodeData, h } from 'snabbdom';

// Function to recursively convert a React element to a Snabbdom VNode
function reactElementToVNode(reactElement: JSX.Element): VNode {
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
    props: { ...props },
    style: props.style
  };
  delete snabbdomProps.props.children;
  delete snabbdomProps.props.style;

  // Convert inner HTML
  if (props.dangerouslySetInnerHTML) {
    snabbdomProps.props.innerHTML = props.dangerouslySetInnerHTML.__html;
    delete snabbdomProps.props.dangerouslySetInnerHTML;
  }

  // Convert children recursively
  const snabbdomChildren = Array.isArray(children)
    ? children.map(reactElementToVNode)
    : [reactElementToVNode(children)];

  // Create Snabbdom VNode
  return h(type, snabbdomProps, snabbdomChildren);
}

export default reactElementToVNode
