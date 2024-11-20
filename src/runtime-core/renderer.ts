import { createComponentInstance, setupCompoent } from "./component"
export function render(vnode,container){

  // patch
  // 
  patch(vnode,container)
}
function patch(vnode,container) {

  // 处理组件
  // processElement()

  // 判断是否为 element 类型
  processComponent(vnode,container)
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode,container)

}
function mountComponent(vnode: any,container) {
  const instance = createComponentInstance(vnode)
  setupCompoent(instance)
  setupRenderEffect(instance,container)
}

function setupRenderEffect(instance: any,container){
  const subTree = instance.render()
  patch(subTree,container)
}

