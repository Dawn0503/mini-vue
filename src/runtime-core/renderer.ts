import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
  } = options
  function render(vnode, container) {
    // patch
    patch(vnode, container, null)
  }
  function patch(vnode, container, parentComponent) {
    // 处理组件，判断 vnode 是 element 还是 component
    const { type, ShapeFlag } = vnode
    // Fragment -> 只渲染 children 
    switch (type) {
      case Fragment:
        ProcessFragment(vnode, container, parentComponent)
        break
      case Text:
        ProcessText(vnode, container)
        break
      default:
        if (ShapeFlag & ShapeFlags.ELEMENT) {
          processElement(vnode, container, parentComponent)
        } else if (ShapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(vnode, container, parentComponent)
        }
        break;
    }
  }

  function ProcessFragment(vnode: any, container: any, parentComponent) {
    mountChildren(vnode, container, parentComponent)
  }

  function processComponent(vnode: any, container: any, parentComponent) {
    mountComponent(vnode, container, parentComponent)

  }


  function processElement(vnode: any, container: any, parentComponent) {
    mountElement(vnode, container, parentComponent)
  }

  function ProcessText(vnode: any, container: any) {
    const { children } = vnode
    const textNode = (vnode.el = document.createTextNode(children))
    container.append(textNode)
  }

  function mountElement(vnode: any, container: any, parentComponent) {
    // 此处的虚拟节点是属于 element 类型的，也就是 App.js 的 div
    const el = (vnode.el = hostCreateElement(vnode.type))
    const { ShapeFlag, children } = vnode
    // children
    if (ShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (ShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // vnode
      mountChildren(vnode, el, parentComponent)
    }
    // el.textContent = children        此处若存在则会覆盖之前设置的内容,故显示[object Object]
    const { props } = vnode
    for (const key in props) {
      const val = props[key]

      hostPatchProp(el, key, val)
    }
    // container.append(el)
    // el.setAttribute("id", "root")
    // document.body.append(el)
    hostInsert(el, container)
  }
  function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach((v) => {
      // 对于每个子节点，都创建新的 vnode 并挂载
      patch(v, container, parentComponent)
    })
  }


  function mountComponent(vnode: any, container, parentComponent) {
    const instance = createComponentInstance(vnode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, vnode, container)
  }

  function setupRenderEffect(instance: any, vnode, container,) {
    // 将代理对象取出并绑定
    const { proxy } = instance
    const subTree = instance.render.call(proxy)
    patch(subTree, container, instance)
    // 所有 element 都已 mount
    vnode.el = subTree.el
  }
  return {
    createApp: createAppAPI(render)
  }
}


