import path from "path";
import { fileURLToPath } from "url";
import HtmlWebpackPlugin from "html-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default {
  mode: "development",
  entry: {
    // 代码分割方式
    index: "./src/index.js",
    other: "./src/js/other.js",
    // index: {
    //   import: "./src/index.js",
    //   dependOn: "shared",
    // },
    // other: {
    //   import: "./src/js/other.js",
    //   dependOn: "shared",
    // },
    // shared: "./src/js/printMe.js", // 共享文件，会单独输出
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true, // clean dist folder
  },
  /**
   * for devlopment we can use 'eval','eval-source-map','eval-cheep-source-map'
   * for production we can use 'source-map' 'hidden-source-map' 'nosources-source-map'
   */
  //   devtool: "eval",
  devServer: {
    static: "./dist",
  },
  plugins: [
    // generate the index.html automatic and attach js file to head label;
    new HtmlWebpackPlugin({
      title: "Output Management",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
      },
      { test: /\.csv$/i, use: ["csv-loader"] },
      { test: /\.xml$/i, use: ["xml-loader"] },
    ],
  },
  optimization: {
    runtimeChunk: "single", // 单独产生runtime文件
    splitChunks: {
      // 用于控制怎么分包，分割公共依赖
      // minSize：20kb 控制最小分包大小
      // cacheGroups 手动控制分包规则，这也是难点所在，可以用到写包大小分析工具进行划分
      chunks: "all",
      //   cacheGroups: {
      //     vendor: {
      //       test: /[\\/]node_modules[\\/]/, // 分割node_module包
      //       name: "vendors",
      //       chunks: "all",
      //       priority: 10,
      //     },
      //     common: { // 其它包之外的代码，用户代码
      //       minChunks: 2,
      //       minSize: 30000, // 30KB
      //       name: "common",
      //       priority: 5,
      //       reuseExistingChunk: true,
      //     },
      //     lodash: {  // 单独对某个库进行分包缓存
      //       test: /lodash/,
      //       name: "lodash",
      //       priority: 20, // Higher priority than vendor
      //       chunks: "all",
      //     },
      //   },
    },
  },
};
