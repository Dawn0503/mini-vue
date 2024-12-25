import { h,ref } from "../../../lib/guide-mini-vue.esm.js"
export const App = {
  name: "App",
  setup() {
    const count = ref(0)
    const onClick = () => {
      count.value++
    }
    return {
      count,
      onClick
    }
  },
  render() {
    console.log("count",this.count.value);
    return h("div",
      {
        id: "root",
      },
      [
        h("div", {}, "count:" + this.count.value),
        h("button", {
          onClick: this.onClick
        }, "click")
      ]
    )
  }
}