const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
      background:'./background.ts',
      bundle:'./src/index.tsx' // the React app
    },

  output: {
    filename: '[name].js', // the output file that can be loaded by the browser
    path: path.resolve(__dirname, 'dist'), // the output directory
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/, // match TypeScript and TSX files
        use: {
          loader:'ts-loader',
          options: {
            transpileOnly: true,
            configFile: 'tsconfig.json'
          }
        },
        exclude: /node_modules/, // exclude node_modules directory
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'], // resolve TypeScript, TSX, JavaScript, JSX extensions
  },
  plugins: [new MiniCssExtractPlugin({
    filename: '[name].css',
  })],
};