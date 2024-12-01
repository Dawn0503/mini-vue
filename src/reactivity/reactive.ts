import { isObject } from "../shared/index";
import { mutableHandles, readonlyHandles, shallowReadonlyHandlers } from "./baseHandler";
import { track, trigger } from "./effect";

// 枚举处理
export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly"
}


// 直接导出 reactive 去接收没有处理过的对象
export function reactive(raw) {
  return new Proxy(raw, mutableHandles)
  // reactive 本质上就是通过Proxy进行一个代理，去拦截。因此就能知道触发get和set的时机
  // 因此先 new 一个 Proxy

}

//只读方法的实现
export function readonly(raw) {
  return createActiveObject(raw, readonlyHandles)
}


export function shallowReadonly(raw) {
  return createActiveObject(raw, shallowReadonlyHandlers)
}

export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY]
}

export function isProxy(value) {
  return isReactive(value) || isReadonly(value)
}

function createActiveObject(raw: any, baseHandlers) {
  if(!isObject(raw)) {
    console.warn(`raw ${raw} 必须是一个对象`);
    return raw;
  }
  return new Proxy(raw, baseHandlers)
}