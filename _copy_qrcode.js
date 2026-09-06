const fs = require('fs');
fs.copyFileSync('webapp/qrcode.min.js', 'WEB/qrcode.min.js');
console.log('Copied qrcode.min.js to WEB/', fs.statSync('WEB/qrcode.min.js').size, 'bytes');
