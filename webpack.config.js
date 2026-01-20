import path from "path";
import { fileURLToPath } from "url";
import HtmlWebpackPlugin from "html-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: {
    index: "./src/index.js",
    print: "./src/js/printMe.js",
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
  devtool: "eval",
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
};
