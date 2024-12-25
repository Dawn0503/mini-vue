import { effect } from "../reactivity";
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
    patch(null,vnode, container, null)
  }
  function patch(n1, n2, container, parentComponent) {
    // 处理组件，判断 vnode 是 element 还是 component
    const { type, ShapeFlag } = n2
    // Fragment -> 只渲染 children 
    switch (type) {
      case Fragment:
        ProcessFragment(n1,n2, container, parentComponent)
        break
      case Text:
        ProcessText(n1,n2, container)
        break
      default:
        if (ShapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1,n2, container, parentComponent)
        } else if (ShapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1,n2, container, parentComponent)
        }
        break;
    }
  }

  function ProcessFragment(n1:any,n2: any, container: any, parentComponent) {
    mountChildren(n2, container, parentComponent)
  }

  function processComponent(n1:any,n2: any, container: any, parentComponent) {
    mountComponent(n2, container, parentComponent)

  }


  function processElement(n1:any,n2: any, container: any, parentComponent) {
    if(!n1){
      mountElement(n2, container, parentComponent)
    }else{
      patchElement(n1,n2, container)
    }
  }

  function patchElement(n1:any,n2: any, container: any) {
    console.log("patchElement");
    console.log("n1", n1);
    console.log("n2", n2);
    
  }

  function ProcessText(n1:any,n2: any, container: any) {
    const { children } = n2
    const textNode = (n2.el = document.createTextNode(children))
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
      patch(null,v, container, parentComponent)
    })
  }


  function mountComponent(vnode: any, container, parentComponent) {
    const instance = createComponentInstance(vnode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, vnode, container)
  }

  function setupRenderEffect(instance: any, vnode, container,) {
    effect(() => {
      if(!instance.isMounted){
        // 将代理对象取出并绑定
        const { proxy } = instance
        const subTree = (instance.subTree = instance.render.call(proxy))
        // subTree 是 vnode 类型 虚拟节点树
        patch(null,subTree, container, instance)
        // 所有 element 都已 mount
        vnode.el = subTree.el
        instance.isMounted = true
      }else{
        // 将代理对象取出并绑定
        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        const prevSubTree = instance.subTree
        instance.subTree = subTree
        console.log(prevSubTree,subTree);
        
        // subTree 是 vnode 类型 虚拟节点树
        patch(prevSubTree,subTree, container, instance)
        // 所有 element 都已 mount
        // vnode.el = subTree.el
        // instance.isMounted = true
      }
    })
  }
  return {
    createApp: createAppAPI(render)
  }
}


