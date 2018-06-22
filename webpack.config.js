module.exports = {
    entry: './public/js/entry.js',
    output: {
        path: __dirname + "/public/js",
        filename: 'main.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                //loader: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    }
};