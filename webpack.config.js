const path = require('path');
const JsonMinimizerPlugin = require('json-minimizer-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");

module.exports = {
    //mode: 'production',
    entry: {
        background: './src/js/background.js',
        options: './src/js/options.js',
        steamstoretooltip: './src/js/steamstoretooltip.js',
    },
    output: {
        filename: 'js/[name].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    //devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist',
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    modules: "umd",
                                    targets: {
                                        chrome: 91,
                                    }
                                }
                            ]
                        ]
                    }
                }
            },
            {
                test: /\.s?css$/,
                use: [
                    "style-loader",
                    "css-loader",
                    "sass-loader",
                ]
            }
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    context: path.resolve(__dirname, './src'),
                    from: '*.json',
                },
                {
                    context: path.resolve(__dirname, "./src/html"),
                    from: "*.html",
                    to: './html'
                }
            ],
        }),
    ],
    optimization: {
        minimizer: [
            new TerserPlugin({ extractComments: false }),
            new JsonMinimizerPlugin(),
            new HtmlMinimizerPlugin({
                minimizerOptions: {
                    collapseWhitespace: true
                }
            }),
        ],
    }
};