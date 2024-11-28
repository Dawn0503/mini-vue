import { ShapeFlags } from "../shared/ShapeFlags"

export function createVNode(type,props?,children?) {

  const vnode = {
    type,
    props,
    children,
    ShapeFlag:getShapeFlag(type),
    el:null,
  }

  // children 是否为 string
  if(typeof children === 'string') {
    vnode.ShapeFlag = vnode.ShapeFlag | ShapeFlags.TEXT_CHILDREN
  } else if(Array.isArray(children)) {
    vnode.ShapeFlag  = vnode.ShapeFlag | ShapeFlags.ARRAY_CHILDREN
  }
  return vnode
}

function getShapeFlag (type) {
  return typeof type === "string" 
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT
}