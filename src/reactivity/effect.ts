import { extend } from "../shared"

class ReactiveEffect {
  private _fn: any;
  deps = []
  active = true
  onStop?: () => void
  // 传入 fn 即在构造函数这接收一个fn
  constructor(fn, public scheduler?) {
    this._fn = fn
  }
  // 调用 run 方法, 执行内部 fn
  run() {
    // 这步让activeEffect 等于 ReactiveEffect
    activeEffect = this

    return this._fn()
  }
  stop() {
    // 给个active状态
    if (this.active) {
      // 使得调用多次 也只执行一次
      // 删除effect
      cleanupEffect(this)
      if (this.onStop) {
        this.onStop
      }
      this.active = false
    }
  }
}
function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  })
}

const targetMap = new Map()
export function track(target, key) {
  // 映射关系：  target -> key -> dep
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep)
  }

  if(!activeEffect) return;
  
  // const dep = new Set()
  dep.add(activeEffect)                   // activeEffect 可能是 undifined ，所以 deps 可能会找不到他
  activeEffect.deps.push(dep)
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target)
  // 取出 deps 等于 depssMap.get(key)
  let dep = depsMap.get(key)
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

let activeEffect;
export function effect(fn, options: any = {}) {
  // 接收一个fn，并立即调用
  const scheduler = options.scheduler
  const _effect = new ReactiveEffect(fn, scheduler)
  Object.assign(_effect,options)
  //extend
  extend(_effect,options)
  _effect.onStop = options.onStop

  _effect.run()
  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner;
}

export function stop(runner) {

  // 指向类里面的stop方法
  runner.effect.stop()
}