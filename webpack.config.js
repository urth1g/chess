module.exports = {
    entry: {
        chess: './public/js/entry.js',
        seek: './public/js/seek.js',
    },
    output: {
        path: __dirname + "/public/js",
        filename: '[name].bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    }
};