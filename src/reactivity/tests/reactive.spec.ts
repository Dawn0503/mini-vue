import { isReactive, reactive, isProxy } from "../reactive";
describe('reactive', () => {
  it('happy path', ()=> {
    const original = {foo: 1}
    const observed = reactive(original);
    expect(observed).not.toBe(original);
    expect(observed.foo).toBe(1);
    expect(isReactive(observed)).toBe(true)
    // isProxy 是检验是不是由 reactive 和 readonly 形成的代理对象
    expect(isProxy(observed)).toBe(true)

  });

  it("nest reactive",() => {
    const original = {
      nested:{
        foo: 1,
      },
      array: [{bar: 2}],
    }
    const observed = reactive(original)
    expect(isReactive(observed.nested)).toBe(true)
    expect(isReactive(observed.array)).toBe(true)
    expect(isReactive(observed.array[0])).toBe(true)
  })
});