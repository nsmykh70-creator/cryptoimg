import { readFileSync, writeFileSync } from 'fs';

let h = readFileSync('web/index.html', 'utf8');

// Fix broken French: dl_android_desc missing opening quote
h = h.replace(
  "dl_android_desc:\\u2018Installez l\\u2019APK sur n\\u2019importe quel appareil Android (Android 7.0+ requis).'",
  "dl_android_desc:'Installez l\\u2019APK sur n\\u2019importe quel appareil Android (Android 7.0+ requis).'"
);

writeFileSync('web/index.html', h, 'utf8');
console.log('Fixed');

// Verify JS parses
const html = readFileSync('web/index.html', 'utf8');
const m = html.match(/<script>\s*const T=\{([\s\S]*?)\n  \};/);
if (m) {
  try {
    const obj = eval('({' + m[1] + '})');
    console.log('JS parses OK, languages:', Object.keys(obj));
  } catch(e) {
    console.error('Parse error:', e.message);
  }
} else {
  console.error('No T object found');
}
