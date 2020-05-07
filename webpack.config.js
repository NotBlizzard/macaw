/* eslint-disable */

const TerserWebpackPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//const VueLoaderPlugin = require("vue-loader/lib/plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
//const CompressionPlugin = require("compression-webpack-plugin");
//.BundleAnalyzerPlugin;
const webpack = require("webpack");
const path = require("path");

module.exports = {
  mode: "production",
  performance: {
    hints: false,
  },
  entry: ["./resources/app.scss", "./resources/App.tsx"],
  devtool: "",
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    //new BundleAnalyzerPlugin(),

    //new VueLoaderPlugin(),
  ],
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  optimization: {
    minimize: true,
    usedExports: true,
    minimizer: [new TerserWebpackPlugin()],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: path.join(__dirname, "/dist/css/"),
            },
          },
          {
            loader: "css-loader",
          },
          {
            loader: "sass-loader",
          },
        ],
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
    ],
  },
};
