'use strict';

const extend = Object.assign;
const isObject = (val) => {
    return val !== null && typeof val === "object";
};
const hasChanged = (val, newValue) => {
    return !Object.is(val, newValue);
};
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);

let activeEffect;
let shouldTrack;
class ReactiveEffect {
    // 传入 fn 即在构造函数这接收一个fn
    constructor(fn, scheduler) {
        this.scheduler = scheduler;
        this.deps = [];
        this.active = true;
        this._fn = fn;
    }
    // 调用 run 方法, 执行内部 fn
    run() {
        // 调用 run 时会收集依赖，为了防止让它再次收集被 stop 删除的依赖
        //  所以用 shouldTrack 来判断是否执行track
        if (!this.active) {
            // 如果 this.active 是 false 则直接调用 fn
            return this._fn();
        }
        shouldTrack = true;
        // 这步让activeEffect 等于 ReactiveEffect
        activeEffect = this;
        const result = this._fn();
        shouldTrack = false;
        return result;
    }
    stop() {
        // 给个active状态
        if (this.active) {
            // 使得调用多次 也只执行一次
            // 删除effect
            cleanupEffect(this);
            if (this.onStop) {
                // 是这一步没有执行，所以在effect的 toBeCalledTimes 单元测试中报错
                this.onStop();
            }
            this.active = false;
        }
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
const targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
    // 映射关系：  target -> key -> dep
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    // 如果dep有activeeffect 就直接return 无需再次收集依赖
    if (dep.has(activeEffect))
        return;
    // const dep = new Set()
    dep.add(activeEffect);
    // activeEffect 可能是 undifined ，所以 deps 可能会找不到他
    activeEffect.deps.push(dep);
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
    /*   // 如果只是一个单纯的 reactive 获取的话，就不会有 activeEffect。
    // activeEffect 是在 effect 的中才会有。也就是定义的类的run函数里边产生。
    if(!activeEffect) return;
    if(!shouldTrack) return; */
}
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    // 取出 deps 等于 depssMap.get(key)
    let dep = depsMap.get(key);
    // 触发依赖
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}
function effect(fn, options = {}) {
    // 接收一个fn，并立即调用
    const scheduler = options.scheduler;
    const _effect = new ReactiveEffect(fn, scheduler);
    Object.assign(_effect, options);
    //extend
    extend(_effect, options);
    _effect.onStop = options.onStop;
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
// 创建 get 逻辑
function createGetter(isReadonly = false, shallow = false) {
    // 不是 Proxy 就不会调用这个 get 方法  
    return function get(target, key) {
        const res = Reflect.get(target, key);
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        if (shallow) {
            return res;
        }
        if (!isReadonly) {
            track(target, key);
        }
        // 判断 res 是不是一个对象，如果则再次调用 reactive
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        // TODO 触发依赖
        trigger(target, key);
        return res;
    };
}
const mutableHandles = {
    get,
    set,
};
const readonlyHandles = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`key:${key} set 失败，因为 target 是 readonly`);
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandles, {
    get: shallowReadonlyGet
});

// 直接导出 reactive 去接收没有处理过的对象
function reactive(raw) {
    return new Proxy(raw, mutableHandles);
    // reactive 本质上就是通过Proxy进行一个代理，去拦截。因此就能知道触发get和set的时机
    // 因此先 new 一个 Proxy
}
//只读方法的实现
function readonly(raw) {
    return createActiveObject(raw, readonlyHandles);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}
function createActiveObject(raw, baseHandlers) {
    if (!isObject(raw)) {
        console.warn(`raw ${raw} 必须是一个对象`);
        return raw;
    }
    return new Proxy(raw, baseHandlers);
}

// ref传来的都是单值，因为 Proxy 只针对一个对象，所以无法使用
// 所以用对象进行包裹（定义一个类）
class RefImpl {
    constructor(value) {
        this.__v_ifRef = true;
        this._rawValue = value;
        // 如果是对象就要用 reactive 包裹，所有的响应式对象都要用 reactive 处理
        // 判断是否对象，决定是否包裹和取值 ↑
        this._value = convert(value);
        // dep 对象就是一个 Set
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        // 判断是否相等，若相等则不触发依赖
        if (hasChanged(newValue, this._rawValue)) {
            this._rawValue = newValue;
            // 值不相等才触发依赖
            // 先修改 value 的值才发起通知
            this._value = convert(newValue);
            triggerEffects(this.dep);
        }
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function ref(value) {
    return new RefImpl(value);
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
function isRef(ref) {
    return !!ref.__v_isRef; // 如果是 1 就是一个 undifined，所以要给它转换成布尔值
}
function unRef(ref) {
    // 是否为 ref 对象，如果是则返回 ref.value，不是则返回值即可
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRefs) {
    // 用 Proxy 来得知什么时候 get 和 set
    return new Proxy(objectWithRefs, {
        // 首先是处理 get，若访问 age，发现是 ref 类型的话就给他返回 .value
        // 否则返回其本身值
        //这也就是 unRef 的应用
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            // 不是 ref 就替换值 。  如果是 ref 对象,则让之前的值等于新的值即可
            if (isRef(target[key]) && !isRef(value)) {
                return target[key].value = value;
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
}

function emit(instance, event, ...args) {
    console.log("emit", event);
    // instance.props -> event
    const { props } = instance;
    // TPP 
    // event 传过来是一个 add 
    const camelize = (str) => {
        return str.replace(/-(\w)/g, (_, c) => {
            return c ? c.toUpperCase() : "";
        });
    };
    const capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };
    const toHandlerKey = (str) => {
        return str ? "on" + capitalize(str) : "";
    };
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
    // attrs
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

function initSlots(instance, children) {
    // slots
    const { vnode } = instance;
    if (vnode.ShapeFlag & 16 /* ShapeFlags.SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
    else if (Array.isArray(children)) {
        normalizeArrSlots(children, instance.slots);
    }
}
function normalizeArrSlots(children, slots) {
    slots.default = [children];
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        // slot
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode, parent) {
    console.log("createComponentInstance", parent);
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        isMounted: false,
        parent,
        provides: parent ? Object.create(parent.provides) : {},
        emit: () => { }
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulCopmonent(instance);
}
function setupStatefulCopmonent(instance) {
    var _a;
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        // 在设置 currentInstance 之前打印
        console.log("Component name:", Component.name);
        console.log("Parent:", (_a = instance.parent) === null || _a === void 0 ? void 0 : _a.type.name);
        console.log("Current provides:", instance.provides);
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        // 在 setup 执行后打印
        console.log("=== After setup ===");
        console.log("Setup result:", setupResult);
        console.log("Instance state:", {
            name: instance.type.name,
            setupState: instance.setupState,
            provides: instance.provides
        });
        handleSetupResult(instance, setupResult);
        setCurrentInstance(null);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === "object") {
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    console.log("finishComponentSetup:", {
        componentName: Component.name,
        hasRender: !!Component.render,
        setupState: instance.setupState
    });
    if (Component.render) {
        instance.render = Component.render;
    }
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        ShapeFlag: getShapeFlag(type),
        el: null,
    };
    // children 是否为 string
    if (typeof children === 'string') {
        vnode.ShapeFlag = vnode.ShapeFlag | 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.ShapeFlag = vnode.ShapeFlag | 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    // 是否为 slots children Object
    if (vnode.ShapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (typeof children === "object") {
            vnode.ShapeFlag |= 16 /* ShapeFlags.SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    return typeof type === "string"
        ? 1 /* ShapeFlags.ELEMENT */
        : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 会将所有东西转换成虚拟节点，后续所有操作都会基于vnode处理
                // component -> vnode
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, } = options;
    function render(vnode, container) {
        // patch
        patch(null, vnode, container, null);
    }
    function patch(n1, n2, container, parentComponent) {
        // 处理组件，判断 vnode 是 element 还是 component
        const { type, ShapeFlag } = n2;
        // Fragment -> 只渲染 children 
        switch (type) {
            case Fragment:
                ProcessFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                ProcessText(n1, n2, container);
                break;
            default:
                if (ShapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    processElement(n1, n2, container, parentComponent);
                }
                else if (ShapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent);
                }
                break;
        }
    }
    function ProcessFragment(n1, n2, container, parentComponent) {
        mountChildren(n2, container, parentComponent);
    }
    function processComponent(n1, n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent);
    }
    function processElement(n1, n2, container, parentComponent) {
        if (!n1) {
            mountElement(n2, container, parentComponent);
        }
        else {
            patchElement(n1, n2);
        }
    }
    function patchElement(n1, n2, container) {
        console.log("patchElement");
        console.log("n1", n1);
        console.log("n2", n2);
    }
    function ProcessText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    function mountElement(vnode, container, parentComponent) {
        // 此处的虚拟节点是属于 element 类型的，也就是 App.js 的 div
        const el = (vnode.el = hostCreateElement(vnode.type));
        const { ShapeFlag, children } = vnode;
        // children
        if (ShapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (ShapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            // vnode
            mountChildren(vnode, el, parentComponent);
        }
        // el.textContent = children        此处若存在则会覆盖之前设置的内容,故显示[object Object]
        const { props } = vnode;
        for (const key in props) {
            const val = props[key];
            hostPatchProp(el, key, val);
        }
        // container.append(el)
        // el.setAttribute("id", "root")
        // document.body.append(el)
        hostInsert(el, container);
    }
    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach((v) => {
            // 对于每个子节点，都创建新的 vnode 并挂载
            patch(null, v, container, parentComponent);
        });
    }
    function mountComponent(vnode, container, parentComponent) {
        const instance = createComponentInstance(vnode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, vnode, container);
    }
    function setupRenderEffect(instance, vnode, container) {
        effect(() => {
            if (!instance.isMounted) {
                // 将代理对象取出并绑定
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy));
                // subTree 是 vnode 类型 虚拟节点树
                patch(null, subTree, container, instance);
                // 所有 element 都已 mount
                vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                // 将代理对象取出并绑定
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                console.log(prevSubTree, subTree);
                // subTree 是 vnode 类型 虚拟节点树
                patch(prevSubTree, subTree, container, instance);
                // 所有 element 都已 mount
                // vnode.el = subTree.el
                // instance.isMounted = true
            }
        });
    }
    return {
        createApp: createAppAPI(render)
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === "function") {
            return createVNode(Fragment, {}, slot(props));
        }
    }
    // 添加默认返回值
    return createVNode(Fragment, {}, []); // 返回一个空的 Fragment
}

function provide(key, value) {
    // 存
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides || {});
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    // qu
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

function createElement(type) {
    console.log("------createElement------");
    return document.createElement(type);
}
function patchProp(el, key, val) {
    console.log("------patchProp------");
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, val);
    }
    else {
        el.setAttribute(key, val);
    }
}
function insert(el, parent) {
    console.log("------insert------");
    parent.append(el);
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
});
function createApp(...args) {
    return renderer.createApp(...args);
}

exports.createApp = createApp;
exports.createAppAPI = createAppAPI;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.effect = effect;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.reactive = reactive;
exports.ref = ref;
exports.renderSlots = renderSlots;
