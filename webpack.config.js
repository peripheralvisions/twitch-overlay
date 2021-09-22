const path = require("path");
const pathToHTML = path.join(__dirname, 'front/main/index.js');

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: pathToHTML,
    output: {
        path: path.join(__dirname, 'dist/overlay'),
        filename: "index.js",
    },
    module: {
        rules: [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-react', '@babel/preset-env']
                }
            }
        }, {
            test: /\.s[ac]ss$/i,
            use: [
              // Creates `style` nodes from JS strings
              "style-loader",
              // Translates CSS into CommonJS
              "css-loader",
              // Compiles Sass to CSS
              "sass-loader",
            ],
        }, {
            test: /\.svg$/,
            use: 'file-loader'
        }
    ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'front/main/index.html'),
        })
    ],
}

// use: [
//     // Creates `style` nodes from JS strings
//     "style-loader",
//     // Translates CSS into CommonJS
//     "css-loader",
//     // Compiles Sass to CSS
//     "sass-loader",
//   ],