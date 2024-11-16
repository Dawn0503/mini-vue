import { effect } from "../effect";
import { ref } from "../ref"

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
})