import { reactive } from "../reactive";
import { effect } from "../effect";
describe('effect', () => {
  // 拆分对象
  it('happy path', () => {
    // 创建一个响应式对象,用effect进行包裹。
    const user = reactive({
      age: 10
    })
    let nextAge;
    // 创建effect对象，用以收集依赖。effect里会接收fn，调用fn，会执行user.age也就是会触发get操作
    // 当触发get时  user这个响应式对象就能把当前fn给收集起来。
    // 这就是依赖收集
    effect(() => {
      // 触发get操作
      nextAge = user.age + 1
    })
    expect(nextAge).toBe(11)

    //update 更新就是触发依赖
    // 修改值的时候： 触发set操作时，会把收集到的fn 拿出来并调用。
    user.age++
    expect(nextAge).toBe(12)
  })
  it('', () => {
    // 1. 调用effect之后会返回一个function,调用function时会再次执行传给effect里的fn，调用fn则把fn的返回值 return
    // 也就是调用runner可以拿到内部fn返回的值
    let foo = 10
    const runner = effect(() => {
      foo++
      return "foo"
    })
    expect(foo).toBe(11)
    const r = runner()
    expect(foo).toBe(12)
    expect(r).toBe("foo")
  });
})