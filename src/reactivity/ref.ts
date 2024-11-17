import { hasChanged, isObject } from "../shared";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

  // ref传来的都是单值，因为 Proxy 只针对一个对象，所以无法使用
  // 所以用对象进行包裹（定义一个类）

class RefImpl {
  private _value: any;
  private _rawValue: any
  // 只有一个 value  也就是只对应一个value
  public dep
  public __v_ifRef = true
  constructor(value) {
    this._rawValue = value
    // 如果是对象就要用 reactive 包裹，所有的响应式对象都要用 reactive 处理
    // 判断是否对象，决定是否包裹和取值 ↑
    this._value = convert(value)

    // dep 对象就是一个 Set
    this.dep = new Set()
  }
  get value() {
    trackRefValue(this)
    return this._value;
  }

  set value(newValue) {
    // 判断是否相等，若相等则不触发依赖
    if (hasChanged(newValue, this._rawValue)) {
      this._rawValue = newValue
      //值不相等才触发依赖
      // 先修改 value 的值才发起通知
      this._value = convert(newValue)
      triggerEffects(this.dep)
    }
  }
}
function convert(value) {
  return isObject(value) ? reactive(value) : value
}
export function ref(value) {
  return new RefImpl(value)
}

function trackRefValue (ref) {
  if (isTracking()) {
    trackEffects(ref.dep)
  }
}

export function isRef(ref){
  return !!ref.__v_isRef  // 如果是 1 就是一个 undifined， 所以要给它转换成布尔值
}

export function unRef(ref){
  // 是否为 ref 对象，如果是则返回 ref.value  ，不是则返回值即可
  return isRef(ref) ? ref.value :ref;
}