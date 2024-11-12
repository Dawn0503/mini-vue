import { mutableHandles, readonlyHandles } from "./baseHandler";
import { track, trigger } from "./effect";



// 直接导出 reactive 去接收没有处理过的对象
export function reactive(raw) {
  return new Proxy(raw,mutableHandles)
  // reactive 本质上就是通过Proxy进行一个代理，去拦截。因此就能知道触发get和set的时机
  // 因此先 new 一个 Proxy

}

//只读方法的实现
export function readonly(raw) {
  return createActiveObject(raw,readonlyHandles)
}

function createActiveObject(raw: any, baseHandlers) {
  return new Proxy(raw,baseHandlers)
}