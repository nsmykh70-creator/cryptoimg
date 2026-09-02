import { readFileSync, writeFileSync } from 'fs';

let h = readFileSync('WEB/index.html', 'utf8');

// Find the i18n script
const scriptStart = h.indexOf('<script>\n  // ======');
const scriptEnd = h.indexOf('</script>', scriptStart);

let script = h.substring(scriptStart + 9, scriptEnd);

// Find the T={...} block boundaries
const tStart = script.indexOf('const T={');
const tEnd = script.indexOf('\n  function applyLang');

let tBlock = script.substring(tStart, tEnd);

// Strategy: replace ALL single quotes inside the T object translation values 
// (between opening ' and closing ') with Unicode right single quotation mark U+2019
// We do this line by line, only on lines that have key:'value' patterns

const lines = tBlock.split('\n');
const fixed = lines.map((line, idx) => {
  // Skip structural lines
  if (line.trim().startsWith('const T') || line.trim() === 'en:{' || 
      line.trim() === 'ru:{' || line.trim() === 'de:{' || 
      line.trim() === 'fr:{' || line.trim() === 'es:{' || 
      line.trim() === 'zh:{' || line.trim() === '}' ||
      line.trim() === '};' || line.trim().startsWith('//')) {
    return line;
  }
  
  // For translation value lines, find all key:'value' pairs and fix apostrophes in values
  // Pattern: key:'value with apostrophes here'
  let result = '';
  let i = 0;
  while (i < line.length) {
    // Look for pattern: word_chars followed by :'
    if (line[i] === ':' && line[i + 1] === "'") {
      // Found start of value: copy key:'
      result += ":'";
      i += 2;
      
      // Now consume until matching closing '
      // The closing ' is followed by , or } or nothing (end of line)
      let value = '';
      while (i < line.length) {
        if (line[i] === "'" && (line[i + 1] === ',' || line[i + 1] === '}' || i === line.length - 1 || line.substring(i + 1, i + 3) === ',\n')) {
          // This is the closing quote
          break;
        } else if (line[i] === "'") {
          // Apostrophe inside value - replace with Unicode right single quote
          value += '\u2019';
          i++;
        } else {
          value += line[i];
          i++;
        }
      }
      result += value;
      // Don't skip the closing quote
    } else {
      result += line[i];
      i++;
    }
  }
  return result;
});

tBlock = fixed.join('\n');
script = script.substring(0, tStart) + tBlock + script.substring(tEnd);
h = h.substring(0, scriptStart + 9) + script + h.substring(scriptEnd);

writeFileSync('WEB/index.html', h);

// Verify
const html = readFileSync('WEB/index.html', 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)];
for (const s of scripts) {
  if (s[1].includes('const T')) {
    try {
      new Function(s[1]);
      console.log('\u2705 i18n script parses OK');
    } catch (e) {
      console.log('\u274c Still broken:', e.message);
    }
  }
}
