const path = require('path');
const src = path.resolve(__dirname, 'src');
const dist = path.resolve(__dirname, 'dist');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
module.exports = {
  entry: {
    index: src + '/js/index.js',
  },
  output: {
    path: path.resolve(dist, 'js'),
    filename: '[name].js',
  },
  watch: true,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: {
                      ie: 8,
                      esmodules: true,
                    },
                    useBuiltIns: 'usage',
                    corejs: 3,
                    modules: 'auto',
                  },
                ],
              ],
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader',
        }),
      },
    ],
  },
  plugins: [
    // new ExtractTextPlugin('css/styles.css'),
    // new HtmlWebpackPlugin({
    //   template: path.resolve(__dirname) + '/index.html',
    //   filename: '../index.html',
    // }),
  ],
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.js', '.css'],
  },
  externals: [],
};
