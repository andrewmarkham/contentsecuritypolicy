const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const outputPath = path.resolve(__dirname, '../dist/Jhoose.Security/ClientResources');

const appConfig = {
  entry: './app.tsx',
  output: {
    filename: 'csp-app.js',
    path: outputPath,
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
  entry: './OnPageEditor/Editor/EditorBridge.tsx',
  output: {
    filename: 'inline-editor-bundle.js',
    path: outputPath,
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
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'OnPageEditor/Scripts'),
          to: path.resolve(outputPath, 'Scripts'),
          // Copy the dojo modules as-is; stop the production build minifying them.
          info: { minimized: true },
        },
      ],
    }),
  ],
};

module.exports = { appConfig, editorConfig };
