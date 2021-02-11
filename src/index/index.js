import '../index.less';

import html from '../example.html'
console.log(html);

console.log('index')

document.getElementById('btn').onclick = function() {
    import('../handle').then(fn => console.log(fn.add(1,8)));
}

if(module && module.hot) {
    module.hot.accept()
}

console.log(a)
setTimeout(function () {
    console.log(a)
}, 5000)


