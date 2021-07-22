const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const GoogleFontsPlugin = require('@beyonk/google-fonts-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin');

module.exports = {
    mode: 'none',
    entry: {
        background: './src/js/background.js',
        options: './src/js/options.js',
        steamstoretooltip: './src/js/steamstoretooltip.js',
        icon: './src/js/icon.js'
    },
    output: {
        filename: 'js/[name].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
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
                                    modules: 'umd',
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
                    'style-loader',
                    'css-loader',
                    'sass-loader',
                ]
            },
            {
                test: /icon\.svg/,
                use: {
                    loader: 'svg-to-png-loader',
                    options: {
                        name: 'icon[width].png',
                        sizes: [
                            '128',
                            '48',
                            '32',
                            '16'
                        ],
                        outputPath: './img'
                    }
                }
            }
        ]
    },
    plugins: [
        new GoogleFontsPlugin({
            fonts: [
                {
                    family: 'Cabin',
                    subsets: [
                        'latin-ext',
                        'vietnamese'
                    ],
                    display: 'auto'
                },
                {
                    family: 'Raleway',
                    variants: ['500'],
                    subsets: ['latin-ext'],
                    display: 'auto'
                }
            ],
            filename: 'fonts.css',
            noLocalInCss: true,
            formats: ['woff']
        }),
        new ReplaceInFileWebpackPlugin([{
            dir: 'dist/font',
            files: ['fonts.css'],
            rules: [
                {
                    search: /\.\/font/g,
                    replace: 'chrome-extension://__MSG_@@extension_id__/font'
                }]
        }]),
        new CopyPlugin({
            patterns: [
                {
                    context: path.resolve(__dirname, './src'),
                    from: '*.json',
                },
                {
                    context: path.resolve(__dirname, './src/html'),
                    from: '*.html',
                    to: './html'
                }
            ],
        }),
        new FileManagerPlugin({
            events: {
                onEnd: {
                    move: [
                        {
                            source: './dist/fonts.css',
                            destination: './dist/font/fonts.css'
                        },
                    ],
                    delete: ['./dist/js/icon.js']
                }
            }
        })
    ]
};