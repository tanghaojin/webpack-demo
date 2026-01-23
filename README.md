#webpack learn

## 优化打包性能

### 1.将loader用在正确的位置上

将loader用在必要的文件上，并且用include限制文件路径，如

```js
const path = require("node:path");

module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, "src"),
        loader: "babel-loader",
      },
    ],
  },
};
```

### 2.尽量少的使用loader/plugin

每个loader/plugin都有启动时间

### 3.resolve配置

resolve 是用来告诉webpack怎么去寻找模块的。
减少 resolve.modules, resolve.extensions, resolve.mainFiles, resolve.descriptionFiles 的配置，因为会增加文件系统的调用。

### 4.使用DllPlugin(webpack 4)

使用dllPlugin分离不常改变的代码块

DllPlugin 是 webpack 提供的一个优化构建性能的插件，核心作用是 将第三方依赖（或不常变动的基础代码）提前编译成独立的动态链接库（DLL），避免在每次业务代码构建时重复编译这些稳定代码，从而大幅提升项目的构建速度。

#### \* 核心原理

它借鉴了 Windows 系统的 DLL（动态链接库）思想：

1. 抽离稳定代码：把项目中不常变化的依赖（如 react、vue、lodash 等第三方库）单独打包成 DLL 文件（一个或多个）。
2. 生成映射清单：通过 DllPlugin 生成一个 manifest.json 文件，该文件记录了 DLL 中各模块的路径、ID 等映射关系。
3. 业务代码复用 DLL：在业务代码构建时，通过 DllReferencePlugin 读取 manifest.json，直接复用已编译的 DLL 代码，不再重新编译这些依赖。

#### \* 注意

webpack 5 可以使用`Module Federation`或`持久化缓存（persistent cache）`替代

### 5.Smaller = Faster 小就是快

尽量将代码减少

1. 使用更简洁的库
2. treeshaking 去掉无用代码
3. 使用splitChunks 抽离重复代码块，防止重复代码块编译到多个地方
4. 部分编译，只编译你现在需要用到的模块

### 6.(dev下的优化)devtool

使用`eval`或`cheap-source-map`等性能比较好的sourceMap,最建议使用`eval-cheap-module-source-map`

### 7.(dev下的优化)不要使用生产环境下的优化

1. TerserPlugin 代码压缩
2. [fullhash]/[chunkhash]/[contenthash] 文件hash指纹
3. ModuleConcatenationPlugin 代码优化

### 8.(dev下的优化)拆分运行时代码

可以使得入口体积减少

```js
module.exports = {
  // ...
  optimization: {
    runtimeChunk: true,
  },
};
```

### 9.(dev下的优化)减少某些优化项

```js
module.exports = {
  // ...
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
  },
};
```

### 10.(dev下的优化)typesctipt

不要使用ts-loader做类型校验，紧紧用来转换代码。生产环境下可以使用ForkTsCheckerWebpackPlugin做校验，它是多线程的。
或者开发时使用swc或esbuild进行ts转换
生产环境下再使用tsc进行类型校验 + ts-loader + babel-loader进行代码转换

```js
module.exports = {
  // ...
  test: /\.tsx?$/,
  use: [
    {
      loader: "ts-loader",
      options: {
        transpileOnly: true,
      },
    },
  ],
};
``;
```

### 10.（生产环境下）使用thread-plugin 多线程编译

不过要注意多线程下，某些loader和plugin需要特殊的配置，比如ts-loader。
