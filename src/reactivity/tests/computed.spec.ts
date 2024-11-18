import { computed } from "../computed"
import { reactive } from "../reactive"

describe("computed", () => {

  it("happy path", () => {
    const user = reactive({
      age: 1
    })
    const age = computed(() => {
      return user.age
    })
    expect(age.value).toBe(1)
  })

  it("should compute lazily", () => {
    const value = reactive({
      foo: 1,
    })
    const getter = jest.fn(() => {
      return value.foo
    })
    const cValue = computed(getter)

    // lazy
    expect(getter).not.toHaveBeenCalled();

    expect(cValue.value).toBe(1)
    expect(getter).toHaveBeenCalledTimes(1)

    // 再一次调用 cValue.value
    cValue.value      // 触发 get 
    expect(getter).toHaveBeenCalledTimes(1)

    // 改变响应式对象的值，并让 getter 执行一次
    // 调用了 trigger， 收集 value 就是与 effect 配对, 再次调用 get 就重新执行s
    value.foo = 2
    expect(getter).toHaveBeenCalledTimes(1)

    expect(cValue.value).toBe(2)

    cValue.value
    expect(getter).toHaveBeenCalledTimes(2)
  })
})