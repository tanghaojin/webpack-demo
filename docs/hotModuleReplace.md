## 热更新 HMR

### 一、为什么需要热更新？

当修改文件后，每次都要手动执行命令处理文件，然后手动刷新浏览器才能看到效果，这是非常麻烦的。解决方法有三个：

1. 使用`webpack --watch` 命令自动根据代码的改变编译新代码，但浏览器还是不会自动更新
2. 使用webpack dev server(WDS), `webpack server` 浏览器会自动刷新，用`window.location.reload()`的方式，这种方式很暴力，不保留页面状态。
3. 使用`WDS + HMR`, 可以保留页面状态，增量更新速度更快

### 二、webpack5 如何实现热更新

只需要一个配置，其它交给webpack自身

```js
devServer: {
    static: "./dist",
    hot: true,
},
```

然后编写热跟新代码

```js
if (import.meta.webpackHot) {
  // 处理其它模块的热更新
  import.meta.webpackHot.accept("./js/printMe.js", function () {
    console.log(`Accepting1b the updated printMe module!--`);
  });
  // 处理自身的热跟新
  import.meta.webpackHot.accept((err) => {
    console.log("aaa");
  });
}
```

webpack中的热更新函数都在这两个对象上`module.hot`或`import.meta.webpackHot`,前者为cjs语法，后者为EMS语法
下面是热跟新的一些API语法：

1. `accept` 接受模块更新

```js
// 处理其它模块
import.meta.webpackHot.accept(
  dependencies, // Either a string or an array of strings
  callback, // Function to fire when the dependencies are updated
  errorHandler, // (err, {moduleId, dependencyId}) => {}
);
// 接受自身热跟新
import.meta.webpackHot.accept(errorHandler);
```

2. `decline` 拒绝模块更新
   如果拒绝了此模块，修改此模块后页面会用live reload方式更新

```js
import.meta.webpackHot.decline(
  dependencies, // Either a string or an array of strings
);
// 拒绝自身模块的跟新
import.meta.webpackHot.decline();
```

3. `dispose` 该处理程序会在当前模块代码被替换时执行

这应该用于移除你所占用或创建的任何持久资源。如果你想将状态转移到更新后的模块，请将其添加到给定的data参数中。更新后，该对象将在module.hot.data处可用。

```js
import.meta.webpackHot.dispose(() => {
  clearInterval(timer); // 清理残留的定时器
  console.log("旧模块已清理，定时器已关闭");
});
```

4. `invalidate `主动使当前文件失效，进入下一次热更新流程

```js
import { processX, processY } from "anotherDep";
import { x, y } from "./dep";

const oldY = y;

processX(x);

export default processY(y);

module.hot.accept("./dep", () => {
  if (y !== oldY) {
    // This can't be handled, bubble to parent
    module.hot.invalidate();
    return;
  }
  // This can be handled
  processX(x);
});
```

### 三、HMR的原理

#### 1. 核心组件

- **Webpack Compiler**: 监视文件并重新编译代码
- **HMR Server**：使用WebSocket和网页通讯
- **HMR Runtime**: 注入到web端的模块（通过HotModuleReplacementPlugin），用于处理文件的更新。

#### 2. 具体流程

1. 文件更改后：webpack编译器会重新编译代码，然后生成两个文件：
   - Manifest JSON ([hash].hot-update.json):

   ```js
   {
    "c": ["index"], // chunkIds 热更新涉及的 Chunk ID 列表
    "r": [], // removedModules 移除的模块 ID 列表
    "m": [] // moduleIds 新增的模块 ID 列表
   }
   ```

   - Update Chunk ([chunk].[hash].hot-update.js): 真实需要更新的模块代码

2. 通过WebSocket通知浏览器的HMR Runtime
3. HMR Runtime 会先请求hot-update.json文件，然后判断需要请求哪些具体的js模块代码
4. 模块替换（Applying）：
   - 调用本模块或夫模块的`module.hot.accept`钩子
   - 如果没有则根据依赖树继续向上寻找
   - 如果找不到，则页面会全量刷新

#### 3.HMR 的状态变化

- `idle` → `check` → `prepare` → `ready` → `dispose` → `apply`

### 四、一些关键的数据结构

1. **模块依赖图**：用于执行冒泡算法，即一层一层往上寻找`module.hot.accept`钩子

### 五、参考库

这些库就已经实现了上面的accept、dispose等命令，所以可以开箱即用

- [`style-loader`](https://github.com/webpack/style-loader)(css文件)
- [`react-hot-loader`](https://github.com/gaearon/react-hot-loader)(react项目)

- [`vue-loader`](https://github.com/vuejs/vue-loader)(vue项目)

vue-loader的hot reload代码非常简单。处理代码时，如果开启了hotReload，就在文件末尾加上genHotReloadCode函数产生的代码，`__VUE_HMR_RUNTIME__` 的代码比较复杂

```js
// __VUE_HMR_RUNTIME__ is injected to global scope by @vue/runtime-core

export function genHotReloadCode(
  id: string,
  templateRequest: string | undefined
): string {
  return `
/* hot reload */
if (module.hot) {
  __exports__.__hmrId = "${id}"
  const api = __VUE_HMR_RUNTIME__
  module.hot.accept()
  if (!api.createRecord('${id}', __exports__)) {
    api.reload('${id}', __exports__)
  }
  ${templateRequest ? genTemplateHotReloadCode(id, templateRequest) : ''}
}
`
}

function genTemplateHotReloadCode(id: string, request: string) {
  return `
  module.hot.accept(${request}, () => {
    api.rerender('${id}', render)
  })
`
}
```
