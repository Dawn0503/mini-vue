import  {readonly , isReadonly} from "../reactive"

describe("readonly", () => {
  it("happy path", () => {
    // 只读，不可被 set ，不会被触发依赖。因此也不需要依赖收集
    const original = {foo: 1,bar: {baz:2}};
    const wrapped = readonly(original);
    expect(wrapped).not.toBe(original)
    expect(isReadonly(wrapped)).toBe(true)
    expect(wrapped.foo).toBe(1)
  })

  it('warn then call set', () => {
    // mock 可构建假的警告方法`
    // jest.fn() 会创建一个 function，可用于后续的断言
    console.warn = jest.fn()
    const user = readonly({
      age:10,
    })
    user.age = 11
    expect(console.warn).toBeCalled()
  })
})