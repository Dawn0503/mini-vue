import { ShapeFlags } from "../shared/ShapeFlags"
export const Fragment = Symbol("Fragment")
export const Text = Symbol("Text")
export function createVNode(type, props?, children?) {

  const vnode = {
    type,
    props,
    children,
    ShapeFlag: getShapeFlag(type),
    el: null,
  }

  // children 是否为 string
  if (typeof children === 'string') {
    vnode.ShapeFlag = vnode.ShapeFlag | ShapeFlags.TEXT_CHILDREN
  } else if (Array.isArray(children)) {
    vnode.ShapeFlag = vnode.ShapeFlag | ShapeFlags.ARRAY_CHILDREN
  }

  // 是否为 slots children Object
  if (vnode.ShapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === "object") {
      vnode.ShapeFlag |= ShapeFlags.SLOT_CHILDREN
    }
  }

  return vnode
}

export function createTextVNode(text: string) {
  return createVNode(Text, {}, text)
}

function getShapeFlag(type) {
  return typeof type === "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT
}