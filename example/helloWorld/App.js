import { h } from "../../lib/guide-mini-vue.esm.js"
export const App = {
  render() {
    return h(
      "div",
      {
        id: "root",
        // 元素类型
        class: ["red", "hard"]
      },
      // "hi", + this.msg
      //数组类型
      [h("p", { class: "red" }, "hi"), h("p", { class: "blue" }, "mini-vue")]
    )
  },
  setup() {
    return {
      msg: "mini-vue"
    }
  }
}