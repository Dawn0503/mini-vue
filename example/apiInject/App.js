import { h, provide, inject } from '../../lib/guide-mini-vue.esm.js'


const Provider = {
  name: "Provider",
  setup() {
    provide("foo", "fooVal");
    provide("bar", "barVal");
  },
  render() {
     return h("div", {}, [h("p", {}, "Provider"), h(ProviderTwo)])
  },
};

const Consumer = {
  name: 'Consumer',
  setup() {
    const foo = inject("foo")
    const bar = inject("bar")
    const baz = inject("baz", () => "bazVal")
    return {
      foo,
      bar,
      baz
    }
  },
  render() {
    return h("div", {}, `Consumer: - ${this.foo} - ${this.bar} - ${this.baz}`)
  }
}



const ProviderTwo = {
  name: "ProviderTwo",
  setup() {
    provide("foo", "fooTwo");
    const foo = inject("foo")
    return {
      foo
    }
  },
  render() {
    return h("div", {}, [h("p", {}, `ProviderTwo foo: ${this.foo}`), h(Consumer)])
  },
};


export const App = {
  name: "App",
  setup() { },
  render() {
    return h("div", {}, [h("p", {}, "apiInject"), h(Provider)])
  }
}