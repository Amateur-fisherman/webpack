class FileListPlugin {
    constructor (options) {
        // 获取插件配置项
        this.filename = options && options.filename ? options.filename : 'FILELIST.md';
    }

    apply (compiler) {
        compiler.hooks.emit.tapAsync('FileListPlugin', (compilation, cb) => {
            // 获取webapck编译的文件数量
            let len = Object.keys(compilation.assets).length
            let content = `${ len } file ${ len > 1 ? 's' : '' } emited bu webpack \n\n`

            for(let filename in compilation.assets) {
                content += `${ filename }\n`
            }

            compilation.assets[this.filename] = {
                source: function () {
                    return content
                },
                // 给webpack输出展示用
                size: function () {
                    return content.length
                }
            }

            // 执行回调，让webpack继续执行
            cb()
        })
    } 
}

module.exports = FileListPlugin