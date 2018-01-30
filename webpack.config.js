const path = require('path');
const webpack = require('webpack');
module.exports = {
    entry: {
        odux: [
            path.resolve(__dirname, 'lib/index.js'),
        ],
        'power-di': ['power-di']
    },
    output: {
        filename: '[name].min.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'umd',
    },
    module: {},
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.optimize.UglifyJsPlugin()
    ],
};
//# sourceMappingURL=webpack.config.js.map