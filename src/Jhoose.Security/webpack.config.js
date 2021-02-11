const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isDevelopment = process.env.NODE_ENV === 'development'

module.exports = {
  mode: 'development',
  entry: './src/app.js',
  devtool: 'inline-source-map',
  output: {
    filename: 'csp-app.js',
    path: path.resolve(__dirname, 'dist/Jhoose.Security/ClientResources'),
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
        test: /\.css$/,
        use: [
            {
                loader: "style-loader",
            },
            {
                loader: "css-loader",
            }
        ],
        include: path.resolve(__dirname, "../")
    }/*,
      {
        test: /\.scss$/,
        use: [
            {
                loader: "style-loader",
            },
            {
                loader: "css-loader",
            }, 
            {
                loader: "sass-loader",
                options: {
                    includePaths: ["node_modules"]
                }
            }
        ],
        include: path.resolve(__dirname, "../")
    }*/
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.scss']
  }
};

/*


            {
                test: /\.module\.s(a|c)ss$/,
                loader: [
                  isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
                  {
                loader: 'css-loader',
                    options: {
                      modules: true,
                      sourceMap: isDevelopment
                    }
                  },
              {
                    loader: 'sass-loader',
                    options: {
                      sourceMap: isDevelopment
                    }
                  }
                ]
              },
              {
                test: /\.s(a|c)ss$/,
                exclude: /\.module.(s(a|c)ss)$/,
                loader: [
                  isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
                  'css-loader',
                  {
                    loader: 'sass-loader',
                    options: {
                      sourceMap: isDevelopment
                    }
                  }
                ]
              }



*/