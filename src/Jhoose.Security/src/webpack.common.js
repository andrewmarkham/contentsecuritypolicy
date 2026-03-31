const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./app.tsx",
  output: {
    filename: "csp-app.js",
    path: path.resolve(__dirname, "../dist/Jhoose.Security/ClientResources"),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
      inject: "body",
    }),
    new HtmlWebpackPlugin({
      template: "./index.cshtml",
      filename: path.resolve(
        __dirname,
        "../Jhoose.Security.Views/Views/JhooseSecurityAdmin/Index.cshtml",
      ),
      publicPath: "ClientResources/",
      inject: "body",
      minify: false,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
        ],
        include: path.resolve(__dirname, "../"),
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".scss"],
  },
};
