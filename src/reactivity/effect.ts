

class ReactiveEffect {
  private _fn: any;
  // 传入 fn 即在构造函数这接收一个fn
  constructor(fn,public scheduler?) {
    this._fn = fn
  }
  // 调用 run 方法, 执行内部 fn
  run() {
    // 这步让activeEffect 等于 ReactiveEffect
    activeEffect = this

    return this._fn()
  }
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
  // const dep = new Set()
  dep.add(activeEffect)
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
export function effect(fn, options: any={}) {
  // 接收一个fn，并立即调用
  const scheduler = options.scheduler
  const _effect = new ReactiveEffect(fn,scheduler)
  _effect.run()
  return _effect.run.bind(_effect)
}