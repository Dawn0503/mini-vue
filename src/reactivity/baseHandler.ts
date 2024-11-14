import { track, trigger } from "./effect";
import { ReactiveFlags, isReactive } from "./reactive";

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

// 创建 get 逻辑
function createGetter(isReadonly = false) {
  // 不是 Proxy 就不会调用这个 get 方法  
  return function get(target, key) {
    const res = Reflect.get(target, key)

    if(key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }

    if (!isReadonly) {
      track(target, key)
    }
    return res;
  }
}

function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value)
    // TODO 触发依赖
    trigger(target, key)
    return res
  }
}
export const mutableHandles = {
  get,
  set,
}

export const readonlyHandles = {
  get:readonlyGet,
  set(target, key, value) {
    console.warn(`key:${key} set 失败，因为 target 是 readonly`)
    return true;
  }
}