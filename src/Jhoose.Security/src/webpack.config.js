const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isDevelopment = process.env.NODE_ENV === 'development'

const appConfig = {
  mode: 'development',
  entry: './app.tsx',
  devtool: 'inline-source-map',
  output: {
    filename: 'csp-app.js',
    path: path.resolve(__dirname, '../dist/Jhoose.Security/ClientResources'),
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
        include: path.resolve(__dirname, "../")
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.scss']
  }
};

const editorConfig = {
  mode: 'development',
  entry: './OnPageEditor/Editor/EditorBridge.tsx',
  devtool: 'inline-source-map',
  output: {
    filename: 'inline-editor-bundle.js',
    path: path.resolve(__dirname, '../dist/Jhoose.Security/ClientResources'),
    library: {
      name: 'InlineEditor',
      type: 'window',
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
        include: path.resolve(__dirname, "../")
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.scss']
  }
};

module.exports = [appConfig, editorConfig];