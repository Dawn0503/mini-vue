import { reactive } from "../reactive";
import { effect, stop } from "../effect";
import { jest } from '@jest/globals'; // 显式导入 jest 方法

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
  it("scheduler", () => {
    // 1.通过 effect 的第二个参数给定的一个 scheduler 的fn
    // 2.effect 第一次执行的时候 还会执行fn
    // 3.当响应式对象 set  update时 不会执行 fn， 而是执行 scheduler
    // 4.如果说当执行 runner 的时候，会再次执行 fn
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      // runner就是 effect返回出来的 function
      run = runner;
    })
    const obj = reactive({ foo: 1 });
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      { scheduler }
    );
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1)
    obj.foo++
    // 说明响应式对象的值发生改变不会调用 effect 而是调用里面的 scheduler
    //并且此时 dummy 的值还是没有改变
    expect(scheduler).toHaveBeenCalledTimes(1)
    expect(dummy).toBe(1)
    // 执行run 说明 effect里的函数被调用
    run()
    expect(dummy).toBe(2)
  })
  it("stop", () => {
    let dummy;
    const obj = reactive({ prop: 1 })
    const runner = effect(() => {
      dummy = obj.prop
    })
    obj.prop = 2
    expect(dummy).toBe(2)
    stop(runner)
    obj.prop = 3
    expect(dummy).toBe(2)
    runner()
    expect(dummy).toBe(3)
  })
  it("onStop", () => {
    const obj = reactive({
      foo: 1,
    })
    const onStop = jest.fn()
    let dummy;
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      {
        onStop,
      }
    )
    stop(runner);
    expect(onStop).toBeCalledTimes(1)
  })
})

