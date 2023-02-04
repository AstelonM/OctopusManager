/* eslint-disable */
module.exports = {
  mode: "development",
  entry: "./src/main/typescript/index.tsx",
  devtool: "inline-source-map",
  output: {
    path: __dirname,
    filename: "./src/main/resources/static/built/bundle.js"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"]
            }
          }
        ]
      }
    ]
  }
}
