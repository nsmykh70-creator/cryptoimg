import { readFileSync, writeFileSync } from 'fs';

let h = readFileSync('build-web-i18n.mjs', 'utf8');

// The problem: template literals strip single backslash escapes like \' 
// Solution: use non-contracted forms (no apostrophes) in all translation strings

const fixes = [
  // English
  ["they can\\'t read", "they cannot read"],
  ["it\\'s used to derive", "is used to derive"],
  ["there\\'s nothing", "there is nothing"],
  ["there\\'s no backdoor", "there is no backdoor"],
  
  // French (l' d')
  ["d\\'image", "d\u2019image"],       // Use right single quote
  ["d\\'authentification", "d\u2019authentification"],
  ["L\\'appli", "L\u2019appli"],
  ["n\\'est", "n\u2019est"],
  ["n\\'utilise", "n\u2019utilise"],
  ["c\\'est", "c\u2019est"],
  ["qu\\'une", "qu\u2019une"],
  ["d\\'erreurs", "d\u2019erreurs"],
  ["l\\'encodage", "l\u2019encodage"],
  ["l\\'extract", "l\u2019extract"],
  ["j\\'ai", "j\u2019ai"],
  
  // Also check for raw apostrophes in the template literal
  ["it's used to derive", "is used to derive"],
  ["there's nothing", "there is nothing"],
  ["there's no backdoor", "there is no backdoor"],
  ["can't read", "cannot read"],
  ["don't", "do not"],
  ["doesn't", "does not"],
  ["won't", "will not"],
  ["isn't", "is not"],
  ["it's", "it is"],
];

for (const [from, to] of fixes) {
  while (h.includes(from)) {
    h = h.replace(from, to);
  }
}

writeFileSync('build-web-i18n.mjs', h);

// Now rebuild
const { execSync } = await import('child_process');
execSync('node build-web-i18n.mjs', { stdio: 'inherit' });

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
