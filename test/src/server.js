const ne_xprest = require('../../dist/ne14_xprest.cjs.min.js');
const xprest = new ne_xprest.Xprest();

xprest.resource('/', 'test/src/index.html');
xprest.stream('/vid', 'test/src/sample.mp4', 'video/mp4');
xprest.start(8998, () => console.log('Ready: http://localhost:8998/'));
