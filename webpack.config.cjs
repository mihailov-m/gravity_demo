/* eslint-disable */

const path = require("path");

const merge = require("webpack-merge").merge;

// plugins
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = (env) => {
    const config = {
        entry: "./src/main.ts",

        resolve: {
            extensions: [".ts", ".tsx", ".js", ".json", ".js", ".jsx"],
        },

        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                        },
                        "css-loader",
                    ],
                },
            ],
        },
        optimization: {
            splitChunks: {
                chunks: "all",
            },
        },

        plugins: [
            new HtmlWebpackPlugin({
                template: "./src/index.html"
            }),
        ],
    };
    const isDev = env.mode === "development";
    const webpackConfigFile = isDev ? "webpack.dev.cjs" : "webpack.prod.cjs";
    const envConfig = require(path.resolve(__dirname, webpackConfigFile))();

    const mergedConfig = merge(config, envConfig);

    return mergedConfig;
};
