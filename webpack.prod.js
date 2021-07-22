const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const JsonMinimizerPlugin = require('json-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlMinimizerPlugin = require('html-minimizer-webpack-plugin');

module.exports = merge(common, {
    mode: 'production',
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
});