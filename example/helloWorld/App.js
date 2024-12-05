import { h } from "../../lib/guide-mini-vue.esm.js"
import { Foo } from "./Foo.js"
window.self = null
export const App = {
  name: "App",
  render() {
    // emit
    return h("div", {}, [h("div", {}, "App"), h(Foo, {
      onAdd(a, b) {
        console.log('onAdd', a, b);
      },
      // add-foo -> addFoo
      onAddFoo(){
        console.log("onAddFoo");
      }
    })])
    /*     
    window.self = this
    return h(
      "div",
      {
        id: "root",
        // 元素类型
        class: ["red", "hard"],
        onClick() {
          console.log("click");
        },
        onMousedown() {
          console.log("mounsedown");
        }
      },
      [
        h("div", {}, "hi," + this.msg),
        h(Foo, {
          count: 1,
        })]
    ) */
    // setupState
    // "hi," + this.msg
    // this.$el：返回根节点 root element
    //数组类型
    // [h("p", { class: "red" }, "hi"), h("p", { class: "blue" }, "mini-vue")]
  },
  setup() {
    return {
      // 将 setup 中的 msg 的值绑定到 render 函数的 this 上
      msg: "mini-vue"
    }
  }
}