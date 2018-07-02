const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
    const mode = argv.mode || 'development';
    const devMode = mode === 'development';
    return {
        mode,
        entry: ['./src/entry.js'],
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'bundle.js',
        },
        resolve: { extensions: ['.js'] },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                        'css-loader'],
                },
                {
                    test: /\.tpl$/,
                    use: {
                        loader: 'underscore-template-loader',
                        options: {
                            engine: 'lodash-es/escape',
                        },
                    },
                },
                {
                    test: /\.js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: 'babel-loader',
                    },
                },
                {
                    test: /\.svg$/,
                    use: [{
                        loader: 'url-loader',
                        options: { limit: 8192 },
                    }],
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './src/index.html',
                favicon: './src/images/favicon.png',
            }),
            new MiniCssExtractPlugin({
                filename: '[name].[hash].css',
                chunkFilename: '[id].[hash].css',
            }),
        ].concat(devMode ? [new webpack.HotModuleReplacementPlugin()] : []),
        devServer: { hot: true },
        devtool: 'source-map',
        externals: ['tls', 'fs', 'net', 'request', 'nsp'],
    };
};
