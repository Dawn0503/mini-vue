import { h } from "../../lib/guide-mini-vue.esm.js"

window.self = null
export const App = {
  render() {
    window.self = this
    return h(
      "div",
      {
        id: "root",
        // 元素类型
        class: ["red", "hard"]
      },
      // setupState
      "hi," + this.msg
      // this.$el：返回根节点 root element
      //数组类型
      // [h("p", { class: "red" }, "hi"), h("p", { class: "blue" }, "mini-vue")]
    )
  },
  setup() {
    return {
      // 将 setup 中的 msg 的值绑定到 render 函数的 this 上
      msg: "mini-vue"
    }
  }
}