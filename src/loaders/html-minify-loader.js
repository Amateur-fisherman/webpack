var Minimize = require('minimize');
var loaderUtils = require('loader-utils');

module.exports = function(source) {
    var opts = loaderUtils.getOptions(this) || {};
    var minimize = new Minimize(opts);
    // return `export default ${ JSON.stringify(minimize.parse(source)) }`;
    return minimize.parse(source)
}
