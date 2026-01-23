# 树摇优化 Tree Shaking

### 什么是树摇

这个词是rollup提出的，本意是指去除没有使用过的死代码以减少代码体积。

### 树摇的理论基础

树摇必须在ESM的基础上，因为ESM是静态导入导出，在编译期间就可以确定代码结构，无法被运行时逻辑动态修改。
import必须写在模块顶层，不能嵌套在if、函数等代码块中。

```js
// ✅ 合法（顶层导入）
import { add } from "./math.js";

// ❌ 非法（运行时动态导入，需用 import() 函数）
if (flag) {
  import { add } from "./math.js";
}
```

而CommonJS是运行时动态加载的。CommonJS 的 require 是运行时执行的函数，可以根据条件动态加载模块，依赖关系只有在代码运行时才能确定。
这种语言设计上的灵活性导致它天生无法tree-shaking。

```js
// ✅ 合法（运行时动态加载）
if (flag) {
  const math = require("./math.js");
}
```

在导入导出上，ESM是实时绑定的，导入方获取的是引用，而非拷贝。

```js
// math.js（ESM）
export let count = 0;
export const add = () => count++;

// index.js
import { count, add } from "./math.js";
add();
console.log(count); // 1（实时更新，因为是引用）
```

commonJS的`module.exports`本质上是一个普通对象，导入时会将对象的属性浅拷贝给导入方，后续模块内部的变化不会同步。

```js
// math.js（CommonJS）
let count = 0;
exports.count = count;
exports.add = () => count++;

// index.js
const { count, add } = require("./math.js");
add();
console.log(count); // 0（拷贝值，不会更新）
```

`important!`
CommonJS 的动态特性是语言层面的设计，而非代码写法问题，这导致静态分析工具无法安全地剔除「未被使用的导出」

1. module.exports 是动态可变的对象

```js
// math.js
exports.add = (a, b) => a + b;

// 运行时动态添加属性
if (Math.random() > 0.5) {
  exports.minus = (a, b) => a - b;
}

// 甚至可以覆盖整个导出对象
module.exports = {
  multiply: (a, b) => a * b,
};
```

哪怕你当前代码没有动态修改，工具也无法保证：

- 模块内部未来不会添加动态修改逻辑；
- 模块是否被其他代码间接修改（比如 monkey patch）。

2. require 的返回值可以被任意操作

这种情况下，工具不敢删除任何导出—— 一旦误删，就会导致运行时错误。

```js
const math = require("./math.js");
// 遍历所有导出属性
Object.keys(math).forEach((key) => {
  console.log(key); // 可能用到所有导出，工具无法判断
});

// 将导出对象传给其他函数
function useMath(m) {
  // 工具无法分析这个函数内部是否用到了 minus
  return m.minus ? m.minus(1, 2) : 0;
}
useMath(math);
```

### webpack 怎么实现树摇

在production 模式下，自动启动树摇。默认使用TerserPlugin。
同时在package.json上配置sideEffects标明什么模块具有副作用，这个字段里的模块不会被树摇优化。

```json
// package.json
{
  "sideEffects": false, // 整个项目都没有副作用，一般不会这样配置
  "sideEffects": [
    "*.css",
    "*.less",
    "./src/utils/global.js" // 这些文件都有副作用，不会被树摇
  ]
}
```

在development模式下，可以手动启用，

```js
module.exports = {
  mode: "development",
  optimization: {
    usedExports: true, // 标记未被使用的导出
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            unused: true, // 剔除未使用的函数/变量
          },
        },
      }),
    ],
  },
};
```
