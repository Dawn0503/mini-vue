import { effect } from "../effect";
import { reactive } from "../reactive";
import { ref, isRef, unRef, proxyRefs } from "../ref"

describe("ref", () => {
  it.only("happy path", () => {
    const a = ref(1)
    expect(a.value).toBe(1)
  })

  it("should be reactive",() => {
    const a = ref(1)
    let dummy;
    let calls = 0;
    effect(() => {
      calls++
      dummy = a.value
    })
    expect(calls).toBe(1)
    expect(dummy).toBe(1)
    // 如果 ref.ts 文件中如果没有 set 属性并接收一个新的值，那么此处报错
    a.value = 2 
    expect(calls).toBe(2)
    expect(dummy).toBe(2)
    // 一样的值应该不再进行 trigger
    /* a.value = 2
    expect(calls).toBe(2)
    expect(dummy).toBe(2) */
  })

  it.skip("should make nested properties reactive", () => {
    const a = ref({
      count:1,
    })
  let dummy;
  effect(() => {
    dummy = a.value.count
  })
  expect(dummy).toBe(1)
  a.value.count = 2
  expect(dummy).toBe(2)
  })

  it("isRef",() => {
    const a = ref(1)
    const user = reactive({
      age: 1,
    })
    expect(isRef(a)).toBe(true)
    expect(isRef(1)).toBe(false)
    expect(isRef(user)).toBe(false)
  })

  it("unRef",() => {
    const a = ref(1)
    expect(unRef(a)).toBe(1)
    expect(unRef(1)).toBe(1)
  })

  it("proxyRefs", () => {
    const user = {
      age: ref(10),
      name: "xiaohong",
    }

    // 首先是处理 get，若访问 age，发现是 ref 类型的话就给他返回 .value
    // 否则返回其本身值

    const proxyUser = proxyRefs(user)
    expect(user.age.value).toBe(10)
    expect(proxyUser.age).toBe(10)
    expect(proxyUser.name).toBe("xiaohong")

    proxyUser.age = 20
    // set 时判断是不是ref类型，如果是则修改 .value 
    
    expect(proxyUser.age).toBe(20)
    expect(user.age.value).toBe(20)    
  })
})