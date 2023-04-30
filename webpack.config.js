const path = require('path');

module.exports = {
  entry: {
      background:'./background.ts',
      popup:'./popup.ts' // the file with import statement
    },
    
  output: {
    filename: '[name].js', // the output file that can be loaded by the browser
    path: path.resolve(__dirname, 'dist'), // the output directory
  },
  module: {
    rules: [
      {
        test: /\.ts$/, // match TypeScript files
        use: 'ts-loader', // use ts-loader to transpile them
        exclude: /node_modules/, // exclude node_modules directory
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'], // resolve both TypeScript and JavaScript extensions
  },
};