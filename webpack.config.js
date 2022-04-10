const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require('path');

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
  },
  mode: "development",
  plugins: [

    // @ts-ignore plugin doc is wrong
    new CopyWebpackPlugin([
      { from: './src/index.html' },
      { from: './src/index.css' },
      { from: './rust/MagicEngineWorklet.js', to: "./MagicEngineWorklet.js" },
      { from: './rust/TextEncoder.js', to: "./TextEncoder.js" },
      // { from: './rust/pkg/*', to: "./pkg/[name].[ext]" }, // left to recompile sh script
    ]),
  ],
  experiments: {
    asyncWebAssembly: true,
    // buildHttp: true,
    // layers: true,
    // lazyCompilation: true,
    outputModule: true,
    syncWebAssembly: true,
    // topLevelAwait: true,
  },
};
