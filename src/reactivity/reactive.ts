import { track , trigger} from "./effect";

// 直接导出 reactive 去接收没有处理过的对象
export function reactive (raw) {
  // reactive 本质上就是通过Proxy进行一个代理，去拦截。因此就能知道触发get和set的时机
  // 因此先 new 一个 Proxy
  return new Proxy(raw, {
    // key 就是获取到用户访问的key
    // key是foo, {foo:1}是对象
    get(target,key){
      const res = Reflect.get(target,key)
      // TODO 依赖收集
      track(target,key);
      
      return res
    },
    
    set(target,key,value) {
      const res = Reflect.set(target,key,value)
      // TODO 触发依赖
      trigger(target,key)
      return res
    }
  })
}