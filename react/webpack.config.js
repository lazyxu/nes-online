var path = require('path');
var webpack = require('webpack');

var ROOT_PATH = path.resolve(__dirname);
var APP_PATH = path.resolve(ROOT_PATH, 'src');
var BUILD_PATH = path.resolve(ROOT_PATH, '../static/js/');

module.exports= {
  entry: {
    bundle: './src/App.jsx',
    react: [
      'react',
      'react-router',
      'react-redux',
      'react-dom',
    ],
  },
  output: {
    path: BUILD_PATH,
    filename: '[name].js',
    publicPath: '/static/'
  },
  resolve: {
      extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['babel'],
        include: APP_PATH
      },
      {
        test: /\.scss$/,
        loaders: ['style', 'css', 'sass']
      }
    ]
  },
  // devtool: 'eval-source-map',
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: ["react"],
      minChunks: Infinity,
    }),
    // new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      output: {
        comments: false,  // remove all comments
      },
      compress: {
        warnings: false
      }
    }),
    new webpack.DefinePlugin({
        __DEBUG__: JSON.stringify(JSON.parse(process.env.DEBUG || 'false')),
        "process.env": {
          NODE_ENV: JSON.stringify("production")
        }
    })
  ]
}
