const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
    const mode = argv.mode || 'development';
    const devMode = mode === 'development';
    return {
        mode,
        entry: ['babel-polyfill', './src/entry.js'],
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
                    use: 'underscore-template-loader',
                },
                {
                    test: /\.js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env'],
                        },
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
            new webpack.HotModuleReplacementPlugin(),
            new MiniCssExtractPlugin({
                filename: '[name].[hash].css',
                chunkFilename: '[id].[hash].css',
            }),
        ],
        devServer: { hot: true },
        devtool: 'source-map',
        externals: ['tls', 'fs', 'net'],
    };
};
