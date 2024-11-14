import { isReadonly, shallowReadonly } from "../reactive";
describe("shallowReadonly", () => {
  // 对外层对象是一个响应式对象，内部则不是响应式对象。 
  test("should not make non-reactive properties reactive", () => {
    const props = shallowReadonly({ n: { foo: 1 } })
    expect(isReadonly(props)).toBe(true)
    expect(isReadonly(props.n)).toBe(false)
  })
})