//webpack.config.js
//首先引入插件
const glob = require('glob');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const isDev = process.env.NODE_ENV === 'development';
const config = require('./public/config')[isDev ? 'dev' : 'build'];
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin');
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();
var HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
var FileListPlugin = require('./src/plugins/FileListPlugin.js')

const setMAP = () => {
    const entry = {}
    const HtmlWebpackPlugins = []
    const entryFiles = glob.sync(path.join(__dirname, './src/*/index.js'))

    entryFiles.map((file) => {
        var pageName = file.match(/src\/(.*)\/index.js/)[1]
        entry[pageName] = file
        HtmlWebpackPlugins.push(
            new HtmlWebpackPlugin({
                template: `./public/${ pageName }.html`,
                filename: `${ pageName }.html`, //打包后的文件名
                chunks: [pageName]
            })
        )
    })

    return {
        entry,
        HtmlWebpackPlugins
    }
}

const {entry, HtmlWebpackPlugins} = setMAP()

const wpConfig = {
    mode: "development",
    devServer: {
        hot: true
    },
    entry: entry,
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[hash:6].js'
    },
    resolve: {
        modules: ['./src/components', 'node_modules'], //从左到右依次查找
        // alias: {
        //     'react-native': '@my/react-native-web' //这个包名是我随便写的哈
        // }
    },
    module: {
        noParse: /jquery|lodash/,
        rules: [
            {
                test: /\.jsx?$/,
                use: [
                    'thread-loader',
                    'cache-loader',
                    {
                        loader: 'babel-loader',
                        options: {
                        presets: ["@babel/preset-env"],
                        plugins: [
                            [
                                "@babel/plugin-transform-runtime",
                                {
                                    "corejs": 3
                                }
                            ]
                        ]
                        }
                    }
                ],
                // exclude: /node_modules/ //排除 node_modules 目录
                include: [path.resolve(__dirname, 'src')]
            },
            {
                test: /\.(le|c)ss$/,
                use: [
                    MiniCssExtractPlugin.loader, //替换之前的 style-loader
                    'css-loader', {
                        loader: 'postcss-loader',
                        options: {
                            plugins: function () {
                                return [
                                    require('autoprefixer')({
                                        "overrideBrowserslist": [
                                            "defaults"
                                        ]
                                    })
                                ]
                            }
                        }
                    }, 'less-loader'
                ],
                exclude: /node_modules/
            },
            {
                test: /\.(png|jpg|gif|jpeg|webp|svg|eot|ttf|woff|woff2)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10240, //10K
                            esModule: false,
                            name: '[name]_[hash:6].[ext]',
                            outputPath: 'assets',
                            esModule: false
                        }
                    },
                    {
                        loader: 'image-webpack-loader' // 压缩图片
                    }
                ],
                exclude: /node_modules/
            },
            {
                
            },
            //html中使用img标签加载图片
            {
                test: /.html$/,
                use: 'html-withimg-loader'
            },
            // 自定义loader
            {
                test: /\.html$/,
                use: ['html-minify-loader']
            }
        ]
    },
    resolveLoader: {
        modules: [path.join(__dirname, './src/loaders'), 'node_modules']
    },
    plugins: [
        ...HtmlWebpackPlugins,
        //打包前清空dist目录，找到 outputPath
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns:['**/*', '!dll', '!dll/**'] //不删除dll目录下的文件
        }),
        // 指定目录拷贝至构建目录,并且不需要编译,注意在CleanWebpackPlugin里忽略
        new CopyWebpackPlugin(
            [{
                from: 'public/js/*.js',
                to: path.resolve(__dirname, 'dist', 'js'),
                flatten: true,
            }],// 还可以继续配置其它要拷贝的文件 
            {
                ignore: ['js/base.js'] // 忽略的文件
            }
        ),
        new MiniCssExtractPlugin({
            filename: 'css/[name][contenthash:8].css' // 构建目录将css放在单独文件夹
        }),
        // 将抽离出来的css文件进行压缩
        new OptimizeCssPlugin(),
        // 热更新插件
        new webpack.HotModuleReplacementPlugin(),
        //忽略 moment 下的 ./locale 目录
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        // 中间缓存提升二次构建速度
        // new HardSourceWebpackPlugin(),
        // 自定义plugin
        new FileListPlugin({
            filename: 'file_list.md'
        })
    ],
    devServer: {
        port: '3001', //默认是8080
        quiet: false, //默认不启用
        inline: true, //默认开启 inline 模式，如果设置为false,开启 iframe 模式
        stats: "errors-only", //终端仅打印 error
        overlay: false, //默认不启用
        clientLogLevel: "silent", //日志等级
        compress: true, //是否启用 gzip 压缩,
        contentBase: path.resolve(__dirname, 'dist')
    },
    devtool: 'cheap-module-eval-source-map'
}

module.exports = smp.wrap(wpConfig);