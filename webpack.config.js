const path = require('path')

module.exports = {
  entry: './public/js/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, "public/js")
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader',
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