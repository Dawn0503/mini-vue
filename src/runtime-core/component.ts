import { shallowReadonly } from "../reactivity/reactive"
import { emit } from "./componentEmit";
import { initProps } from "./componentProps"
import { PublicInstanceProxyHandlers } from "./componentPublicInstance"
import { initSlots } from "./componentSlots";

export function createComponentInstance(vnode, parent) {
  console.log("createComponentInstance", parent);

  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    slots: {},
    parent,
    provides: parent ? Object.create(parent.provides) : {},
    emit: () => { }
  }
  component.emit = emit.bind(null, component) as any;
  return component
}

export function setupComponent(instance) {
  initProps(instance, instance.vnode.props)
  initSlots(instance, instance.vnode.children)
  setupStatefulCopmonent(instance)
}

function setupStatefulCopmonent(instance: any) {

  const Component = instance.type

  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)

  const { setup } = Component

  if (setup) {
    // 在设置 currentInstance 之前打印
    console.log("Component name:", Component.name);
    console.log("Parent:", instance.parent?.type.name);
    console.log("Current provides:", instance.provides);

    setCurrentInstance(instance)
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    })
    // 在 setup 执行后打印
    console.log("=== After setup ===");
    console.log("Setup result:", setupResult);
    console.log("Instance state:", {
      name: instance.type.name,
      setupState: instance.setupState,
      provides: instance.provides
    });

    handleSetupResult(instance, setupResult)
    setCurrentInstance(null)
  }
}

function handleSetupResult(instance, setupResult: any) {
  if (typeof setupResult === "object") {
    instance.setupState = setupResult
  }
  finishComponentSetup(instance)
}
function finishComponentSetup(instance: any) {
  const Component = instance.type
  console.log("finishComponentSetup:", {
    componentName: Component.name,
    hasRender: !!Component.render,
    setupState: instance.setupState
  })
  if (Component.render) {
    instance.render = Component.render
  }
}

let currentInstance = null
export function getCurrentInstance() {
  return currentInstance
}

export function setCurrentInstance(instance) {
  currentInstance = instance
}