import { h } from "../../lib/guide-mini-vue.esm.js";
export const Foo = {

  setup(props) {
    // props.count
    console.log(props);
    // props 不可被修改，是 readonly 的响应式对象
 
    props.count++
    console.log(props);
  },
  render() {
    return h("div", {}, "foo:" + this.count)
  }
}