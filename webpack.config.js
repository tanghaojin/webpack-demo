import path from "path";
import { fileURLToPath } from "url";
import HtmlWebpackPlugin from "html-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default (env) => {
  // "build": "webpack build --mode production --env md",
  console.log("env: ", env);
  return {
    mode: "development",
    stats: "normal",
    entry: {
      other: "./src/js/other.js",
    },
    output: {
      filename: "[name].[contenthash].bundle.js",
      path: path.resolve(__dirname, "dist"),
      clean: true, // clean dist folder
    },
    /**
     * for devlopment we can use 'eval','eval-source-map','eval-cheep-source-map'
     * for production we can use 'source-map' 'hidden-source-map' 'nosources-source-map'
     */
    devtool: "inline-source-map",
    devServer: {
      static: "./dist",
      hot: true,
    },
    plugins: [
      // generate the index.html automatic and attach js file to head label;
      new HtmlWebpackPlugin({
        title: "Caching",
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
      runtimeChunk: "single",
      usedExports: true, // tree shaking
    },
  };
};
