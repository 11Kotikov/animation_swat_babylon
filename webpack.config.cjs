const { info } = require('console');
const path = require('path');
const webpack = require('webpack');
module.exports = (env)=>
({
  mode: 'development',
  entry: './src/index.js',
  stats:'errors-only',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js'
  },
  devtool:'source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 9000,
    watchFiles: ['src/**/*.js', 'public/**/*'],
    hot:true,
    client:{
      logging:'log',
      progress:true
    }
  },
  experiments:{
    topLevelAwait: true
  },
  plugins:[
    new webpack.DefinePlugin({
      'process.env.RESULT': JSON.stringify(env.result)
    }),
  ]
});