const path = require('path')

module.exports = {
  entry: './public/js/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, "public/dist-js")
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.(sc|sa|c)ss$/i,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
          {
            loader: "postcss-loader",
             options: {
               postcssOptions: {
                 plugins: [
                  require("autoprefixer")()
                 ]
               }
            }, 
          }
        ]
      }
    ]
  }
}