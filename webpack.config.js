const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const path = require('path');

const appRootPath = path.resolve(__dirname, 'app');

module.exports = {
    entry: {
        main: './app/Main.jsx'
    },

    output: {
        filename: './dist/[name].js',
        publicPath: '/',
        path: './dist'
    },

    resolve: {
      extensions: ['', '.js', '.jsx'],
      alias: {
        'Models': path.join(appRootPath, 'Models'),
        'Modules': path.join(appRootPath, 'Modules'),
        'Shared': path.join(appRootPath, 'Shared'),
        'Utils': path.join(appRootPath, 'Utils')
      }
    },

    devtool: 'cheap-inline-module-source-map',

    plugins: [
        new webpack.ProvidePlugin({
            'React': 'react',
            'ReactDOM': 'react-dom'
        }),
        new HtmlWebpackPlugin({
            template: './index.html',
            inject: 'body'
        }),
        new ExtractTextWebpackPlugin("[name].css", { allChunks: true })
    ],

    module: {
        preLoaders: [
            // Javascript
            { test: [/\.js$/, /\.jsx$/], loader: 'eslint', exclude: /node_modules/ }
        ],
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /\/node_modules\//,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015', 'react', 'stage-2']
                }
            },
            {
                test: /\.html$/,
                loader: 'raw'
            },
            {
                test: /\.jade$/,
                loader: 'jade'
            },
            {
                test: /\.less$/,
                loader: 'style!css!less'
            },
            {
                test: /\.styl$/,
                loader: ExtractTextWebpackPlugin.extract('css!postcss!stylus?resolve url')
            },
            // {
            //     test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
            //     loader: 'file'
            // }
            {
                test: /\.(jpe?g|png|gif)$/i,
                loader: 'file?hash=sha512&digest=hex&name=dist/images/[name].[ext]?[hash:6]'
            },
        ]
    },

    eslint: {
        failOnWarning: false,
        failOnError: false,

    },

    devServer: {
        contentBase: __dirname + '/app'
    }
};
