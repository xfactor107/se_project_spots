/**
 * Webpack build configuration.
 *
 * Webpack starts at src/pages/index.js, follows every import (JS, CSS,
 * images, fonts), and outputs a ready-to-deploy site in dist/:
 *   dist/index.html  <- generated from src/index.html
 *   dist/main.js     <- all JavaScript, transpiled by Babel
 *   dist/main.css    <- all CSS, processed by PostCSS
 *   + images and fonts with hashed file names
 *
 * `npm run dev`   -> dev server with live reload (nothing written to disk)
 * `npm run build` -> production build (minified) into dist/
 */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: {
    main: "./src/pages/index.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
    // Relative asset URLs so the site also works from a sub-path like
    // https://xfactor107.github.io/se_project_spots/
    publicPath: "",
  },

  mode: "development", // overridden by --mode in the npm scripts
  devtool: "inline-source-map", // lets browser devtools show the original source
  stats: "errors-only", // keep terminal output quiet unless something breaks
  devServer: {
    static: path.resolve(__dirname, "./dist"),
    compress: true,
    port: 8080,
    open: true,
    liveReload: true,
    hot: false,
  },
  // Output code that older browsers understand (paired with Babel below).
  target: ["web", "es5"],
  module: {
    rules: [
      // JavaScript: Babel converts modern syntax for older browsers
      // (settings in babel.config.js).
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/,
      },
      // CSS: css-loader resolves @import and url(); postcss-loader adds
      // vendor prefixes and minifies (postcss.config.js); then
      // MiniCssExtractPlugin writes it all to a separate .css file.
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
            },
          },
          "postcss-loader",
        ],
      },
      // Images and fonts: copied to dist/ as files, and their imports
      // are replaced with the final URL.
      {
        test: /\.(png|svg|jpg|jpeg|webp|gif|woff(2)?|eot|ttf|otf)$/,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    // Builds dist/index.html from the template and injects main.js/main.css.
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      favicon: "./src/images/favicon.ico",
    }),
    new CleanWebpackPlugin(), // empties dist/ before each build
    new MiniCssExtractPlugin(), // outputs CSS as a file instead of inside JS
  ],
};
