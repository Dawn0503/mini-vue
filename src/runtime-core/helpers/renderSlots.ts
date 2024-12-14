import { createVNode, Fragment } from "../vnode"
export function renderSlots(slots, name, props) {

  const slot = slots[name]
  if (slot) {
    if (typeof slot === "function") {
      return createVNode(Fragment, {}, slot(props))
    }
  }
      // 添加默认返回值
      return createVNode(Fragment, {}, []); // 返回一个空的 Fragment
}