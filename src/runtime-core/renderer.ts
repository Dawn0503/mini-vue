import { ShapeFlags } from "../shared/ShapeFlags";
import { isObject } from "../shared/index";
import { createComponentInstance, setupComponent } from "./component"
export function render(vnode, container) {

  // patch
  patch(vnode, container)
}
function patch(vnode, container) {

  // 处理组件，判断 vnode 是 element 还是 component
  console.log(vnode.type);
  const { ShapeFlag } = vnode
  if (ShapeFlag & ShapeFlags.ELEMENT) {

    processElement(vnode, container)
  } else if (ShapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    processComponent(vnode, container)
  }
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container)

}


function processElement(vnode: any, container: any) {
  mountElement(vnode, container)
}
function mountElement(vnode: any, container: any) {
  // 此处的虚拟节点是属于 element 类型的，也就是 App.js 的 div
  const el = (vnode.el = document.createElement(vnode.type))
  const { ShapeFlag, children } = vnode
  // children
  if (ShapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children
  } else if (ShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    // vnode
    mountChildren(vnode, el)
  }
  // el.textContent = children        此处若存在则会覆盖之前设置的内容,故显示[object Object]
  const { props } = vnode
  for (const key in props) {
    console.log(key);
    const val = props[key]
    const isOn = (key:string) => /^on[A-Z]/.test(key);
    if(isOn(key)) {
      const event = key.slice(2).toLowerCase()
      el.addEventListener(event,val)
    } else {
      el.setAttribute(key, val)
    }
  }
  container.append(el)
  // el.setAttribute("id", "root")
  // document.body.append(el)
}
function mountChildren(vnode: any, container: any) {
  vnode.children.forEach((v) => {
    patch(v, container)
  })
}


function mountComponent(vnode: any, container) {
  const instance = createComponentInstance(vnode)
  setupComponent(instance)
  setupRenderEffect(instance, vnode, container)
}

function setupRenderEffect(instance: any, vnode, container) {
  // 将代理对象取出并绑定
  const { proxy } = instance
  const subTree = instance.render.call(proxy)
  patch(subTree, container)
  // 所有 element 都已 mount
  vnode.el = subTree.el

}



