import { createVNode } from "./vnode"
import { render } from "./renderer"
export function createApp(rootComponent){

  return {
    mount(rootContainer){

      // 会将所有东西转换成虚拟节点，后续所有操作都会基于vnode处理
      // component -> vnode
      const vnode = createVNode(rootComponent)

      render(vnode,rootContainer)
    }
  }
}

