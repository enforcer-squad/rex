# @enforcer-squad/rex

a simple react state solution

一个简单易用几乎没有学习成本的react状态解决方案。基于proxy，解决react无效rerender问题，让你毫无心智负担的搞定react状态管理。支持ts类型提示，良好的编程体验即刻开启！

## createModel

### 描述

`createModel` 用于初始化一个响应式状态模型。它接受一个对象，该对象定义了初始状态和操作这些状态的方法。这些方法可以直接修改状态属性，然后对使用useModel的组件进行按需更新，方法支持同步异步，写就好了，没有新概念。

### 使用示例

```javascript
import { createModel } from '@enforcer-squad/rex';

const state = createModel({
  person: {
    name: 'Alice',
    age: 25,
  },
  incrementAge() {
    state.person.age++;
  },
   async getData() {
    const name: string = await new Promise(resolve => {
      setTimeout(() => {
        resolve('async getData');
      }, 1000);
    });
    state.incrementAge();
  },
});
```

## useModel

### 描述

`useModel` 是一个 React 钩子，用于在组件中访问通过 `createModel` 创建的状态模型。它提供对模型中状态的访问以及状态操作函数的调用。哪里使用哪里引^\_^

### 使用示例

```javascript
import { useModel } from '@enforcer-squad/rex';

const { person, incrementAge } = useModel(state);

return (
  <div>
    <p>Name: {person.name}</p>
    <p>Age: {person.age}</p>
    <button onClick={incrementAge}>Age +1</button>
  </div>
);
```

## devtools

### 描述

`devtools` 用于将状态模型连接到浏览器的开发者工具，以便于调试。它允许开发者实时查看状态变更，帮助优化和排查问题。

### 使用示例

```javascript
import { devtools } from '@enforcer-squad/rex';

devtools(state, { name: 'AppState' });
```

## useReactive

### 描述

`useReactive` 是一个钩子，用于在组件内部创建一个响应式状态。状态的任何更改都会导致使用此状态的组件重新渲染。用于替换`React.useState`，支持值类型和引用类型

### 使用示例

```javascript
import { useReactive } from '@enforcer-squad/rex';

const [state, setState] = useReactive({ count: 0 });

return (
  <div>
    <p>Count: {state.count}</p>
    <button onClick={() => setState(s => (s.count += 1))}>Increment</button>
  </div>
);
```

## useComputed

### 描述

`useComputed` 是一个钩子，用于在组件内部创建计算属性。这个属性会基于依赖项自动重新计算，当依赖项更改时触发重新渲染。用于替换`React.useCallback`和`React.useMemo`。

### 使用示例

```javascript
import { useComputed } from '@enforcer-squad/rex';

const total = useComputed(() => state.items.length, [state.items]);

return <div>Total Items: {total}</div>;
```

## useWatch

### 描述

`useWatch` 是一个钩子，用于监听响应式状态的变化，并执行回调函数。这对于执行副作用或响应状态变化非常有用。用于替换`React.useEffect`。

### 使用示例

```javascript
import { useWatch } from '@enforcer-squad/rex';

useWatch(() => {
  console.log('Name changed:', state.person.name);
}, [state.person.name]);
```

## reactiveMemo

### 描述

`reactiveMemo` 类似于 React 的 `React.memo`，用于优化性能，防止不必要的组件重新渲染。当传入的 props 或响应式依赖发生变化时，组件才会重新渲染。
**【这里要注意如果使用了Rex状态解决方案，那么必须要用`reactiveMemo`替换原来`React.memo`才能达到原来`React.memo`的效果】**

### 使用示例

```javascript
import { reactiveMemo } from '@enforcer-squad/rex';

const TestComponent = reactiveMemo(({ value }) => {
  console.log('Component re-rendering');
  return <div>{value}</div>;
});
```

## toRaw

### 描述

`toRaw` 函数用于获取响应式对象的原始数据，这通常用于调试或在需要非响应式数据的场景中使用。

### 使用示例

```javascript
import { toRaw } from '@enforcer-squad/rex';

const rawState = toRaw(state);
console.log('Raw state:', rawState);
```
