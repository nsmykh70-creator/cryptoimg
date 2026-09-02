import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
let h = readFileSync(resolve(__dir, 'WEB/index.html'), 'utf8');

// Find the i18n script block
const scriptStart = h.indexOf('<script>\n  // ======');
const scriptEnd = h.indexOf('</script>', scriptStart);

let script = h.substring(scriptStart + 9, scriptEnd);

// Strategy: extract the T={...} object text and fix all apostrophes inside single-quoted values
// We'll replace all single quotes in translation values with \'

const lines = script.split('\n');
const fixed = [];
for (const line of lines) {
  // Only fix lines inside the T={} object that have key:'value' patterns
  // Match lines like: key:'value with apostrophe here',key2:'value2'
  if (line.includes(":'") && !line.includes('function') && !line.includes('addEventListener') && !line.includes('querySelector') && !line.includes('applyLang') && !line.includes('localStorage') && !line.includes('const T') && !line.includes('document.') && !line.includes('//')) {
    // This is a translation value line - escape any apostrophes inside the values
    // Strategy: split by key:'pattern and fix
    let result = '';
    let inVal = false;
    let i = 0;
    while (i < line.length) {
      const c = line[i];
      if (!inVal) {
        result += c;
        if (c === "'" && line.substring(0, i).endsWith(":'")) {
          inVal = true;
        }
      } else {
        if (c === "'" && line[i + 1] === ',') {
          // End of value
          result += c;
          inVal = false;
        } else if (c === "'" && line[i + 1] === '\n') {
          result += c;
          inVal = false;
        } else if (c === "'" && i === line.length - 1) {
          result += c;
          inVal = false;
        } else if (c === "'") {
          // Apostrophe inside value - escape it
          result += "\\'";
        } else {
          result += c;
        }
      }
      i++;
    }
    fixed.push(result);
  } else {
    fixed.push(line);
  }
}

script = fixed.join('\n');
h = h.substring(0, scriptStart + 9) + script + h.substring(scriptEnd);

writeFileSync(resolve(__dir, 'WEB/index.html'), h);

// Verify
const scripts2 = [...h.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)];
for (const s of scripts2) {
  if (s[1].includes('const T')) {
    try {
      new Function(s[1]);
      console.log('✅ i18n script parses OK');
    } catch (e) {
      console.log('❌ Still broken:', e.message);
    }
  }
}
