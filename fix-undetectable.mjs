import fs from 'fs';

const files = ['WEB/index.html', 'webapp/index.html'];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf-8');
  
  // EN - table row
  content = content.replace(
    "Data hidden in least-significant bits. Statistically undetectable.",
    "Data hidden in least-significant bits. Designed to minimize statistical artifacts via adaptive pixel selection."
  );
  
  // EN - FAQ answer (HTML version)
  content = content.replace(
    "Cryptoimg uses LSB steganography in variance-filtered pixels. The changes are statistically undetectable \u2014 the modified pixels look identical to the original.",
    "Cryptoimg uses LSB steganography in variance-filtered pixels with keyed permutation. The changes are designed to minimize statistical artifacts \u2014 the modified pixels look visually identical to the original. Note: no steganography is truly undetectable against a determined adversary with the original image."
  );
  
  // EN - JS translation
  content = content.replace(
    "t6_p:'Data hidden in least-significant bits. Statistically undetectable.'",
    "t6_p:'Data hidden in least-significant bits. Designed to minimize statistical artifacts via adaptive pixel selection.'"
  );
  content = content.replace(
    "faq1_a:'Cryptoimg uses LSB steganography in variance-filtered pixels. The changes are statistically undetectable \\u2014 the modified pixels look identical to the original.'",
    "faq1_a:'Cryptoimg uses LSB steganography in variance-filtered pixels with keyed permutation. The changes are designed to minimize statistical artifacts \\u2014 the modified pixels look visually identical to the original. Note: no steganography is truly undetectable against a determined adversary with the original image.'"
  );
  
  // RU - JS translation  
  content = content.replace(
    "t6_p:'\u0414\u0430\u043D\u043D\u044B\u0435 \u0441\u043A\u0440\u044B\u0442\u044B \u0432 \u043C\u043B\u0430\u0434\u0448\u0438\u0445 \u0431\u0438\u0442\u0430\u0445. \u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u043D\u0435\u043E\u0431\u043D\u0430\u0440\u0443\u0436\u0438\u043C\u043E.'",
    "t6_p:'\u0414\u0430\u043D\u043D\u044B\u0435 \u0441\u043A\u0440\u044B\u0442\u044B \u0432 \u043C\u043B\u0430\u0434\u0448\u0438\u0445 \u0431\u0438\u0442\u0430\u0445. \u041C\u0438\u043D\u0438\u043C\u0438\u0437\u0430\u0446\u0438\u044F \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0445 \u0430\u0440\u0442\u0435\u0444\u0430\u043A\u0442\u043E\u0432 \u0430\u0434\u0430\u043F\u0442\u0438\u0432\u043D\u044B\u043C \u0432\u044B\u0431\u043E\u0440\u043E\u043C \u043F\u0438\u043A\u0441\u0435\u043B\u0435\u0439.'"
  );
  content = content.replace(
    "faq1_a:'Cryptoimg \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442 LSB-\u0441\u0442\u0435\u0433\u0430\u043D\u043E\u0433\u0440\u0430\u0444\u0438\u044E \u0432 \u0444\u0438\u043B\u044C\u0442\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0445 \u043F\u043E \u0432\u0430\u0440\u0438\u0430\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438 \u043F\u0438\u043A\u0441\u0435\u043B\u044F\u0445. \u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u043D\u0435\u043E\u0431\u043D\u0430\u0440\u0443\u0436\u0438\u043C\u044B.'",
    "faq1_a:'Cryptoimg \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442 LSB-\u0441\u0442\u0435\u0433\u0430\u043D\u043E\u0433\u0440\u0430\u0444\u0438\u044E \u0432 \u0444\u0438\u043B\u044C\u0442\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0445 \u043F\u043E \u0432\u0430\u0440\u0438\u0430\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438 \u043F\u0438\u043A\u0441\u0435\u043B\u044F\u0445 \u0441 \u043A\u043B\u044E\u0447\u0435\u0432\u043E\u0439 \u043F\u0435\u0440\u0435\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u043E\u0439. \u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u043C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u043E \u043C\u0438\u043D\u0438\u043C\u0438\u0437\u0438\u0440\u0443\u044E\u0442 \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0430\u0440\u0442\u0435\u0444\u0430\u043A\u0442\u044B \u2014 \u043F\u0438\u043A\u0441\u0435\u043B\u0438 \u0432\u044B\u0433\u043B\u044F\u0434\u044F\u0442 \u0432\u0438\u0437\u0443\u0430\u043B\u044C\u043D\u043E \u0438\u0434\u0435\u043D\u0442\u0438\u0447\u043D\u044B\u043C\u0438 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0443. \u041F\u0440\u0438\u043C\u0435\u0447\u0430\u043D\u0438\u0435: \u0441\u0442\u0435\u0433\u0430\u043D\u043E\u0433\u0440\u0430\u0444\u0438\u044F \u043D\u0435 \u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E \u043D\u0435\u043E\u0431\u043D\u0430\u0440\u0443\u0436\u0438\u043C\u043E\u0439 \u043F\u0440\u0438 \u043D\u0430\u043B\u0438\u0447\u0438\u0438 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F.'"
  );
  
  // DE
  content = content.replace(
    /t6_p:'[^']*nicht nachweisbar[^']*'/,
    "t6_p:'Daten in LSB versteckt. Minimierung statistischer Artefakte durch adaptive Pixelauswahl.'"
  );
  content = content.replace(
    /faq1_a:'[^']*nicht nachweisbar[^']*'/,
    "faq1_a:'Cryptoimg verwendet LSB-Steganographie in varianzgefilterten Pixeln mit Keyed Permutation. Die Änderungen minimieren statistische Artefakte \u2014 die modifizierten Pixel sehen visuell identisch zum Original aus. Hinweis: Keine Steganographie ist vollständig unentdeckbar gegen einen bestimmten Gegner mit dem Originalbild.'"
  );
  
  // FR
  content = content.replace(
    "t6_p:'Donn\u00E9es cach\u00E9es dans les bits de poids faible. Statiquement ind\u00E9tectable.'",
    "t6_p:'Donn\u00E9es cach\u00E9es dans les bits de poids faible. Minimisation des artefacts statistiques via s\u00E9lection adaptative des pixels.'"
  );
  content = content.replace(
    "faq1_a:'Cryptoimg utilise la st\u00E9ganographie LSB dans les pixels filtr\u00E9s par variance. Les changements sont statistiquement ind\u00E9tectables.'",
    "faq1_a:'Cryptoimg utilise la st\u00E9ganographie LSB dans les pixels filtr\u00E9s par variance avec permutation \u00E0 cl\u00E9. Les modifications minimisent les artefacts statistiques \u2014 les pixels modifi\u00E9s sont visuellement identiques \u00E0 l\\'original. Remarque : aucune st\u00E9ganographie n\\'est v\u00E9ritablement ind\u00E9tectable face \u00E0 un adversaire d\u00E9termin\u00E9 avec l'image originale.'"
  );
  
  // ES
  content = content.replace(
    "t6_p:'Datos ocultos en bits menos significativos. Estad\u00EDsticamente indetectable.'",
    "t6_p:'Datos ocultos en bits menos significativos. Minimizaci\u00F3n de artefactos estad\u00EDsticos mediante selecci\u00F3n adaptativa de p\u00EDxeles.'"
  );
  content = content.replace(
    "faq1_a:'Cryptoimg usa esteganograf\u00EDa LSB en p\u00EDxeles filtrados por varianza. Los cambios son estad\u00EDsticamente indetectables.'",
    "faq1_a:'Cryptoimg usa esteganograf\u00EDa LSB en p\u00EDxeles filtrados por varianza con permutaci\u00F3n con clave. Los cambios minimizan los artefactos estad\u00EDsticos \u2014 los p\u00EDxeles modificados son visualmente id\u00E9nticos al original. Nota: ninguna esteganograf\u00EDa es verdaderamente indetectable contra un adversario determinado con la imagen original.'"
  );
  
  // ZH
  content = content.replace(
    "t6_p:'\u6570\u636E\u9690\u85CF\u5728\u6700\u4F4E\u6709\u6548\u4F4D\u4E2D\u3002\u7EDF\u8BA1\u4E0A\u4E0D\u53EF\u68C0\u6D4B\u3002'",
    "t6_p:'\u6570\u636E\u9690\u85CF\u5728\u6700\u4F4E\u6709\u6548\u4F4D\u4E2D\u3002\u901A\u8FC7\u81EA\u9002\u5E94\u50CF\u7D20\u9009\u62E9\u6700\u5C0F\u5316\u7EDF\u8BA1\u4F2A\u5F71\u3002'"
  );
  content = content.replace(
    "faq1_a:'Cryptoimg \u4F7F\u7528\u65B9\u5DEE\u8FC7\u6EE4\u50CF\u7D20\u4E2D\u7684 LSB \u9690\u5199\u672F\u3002\u4FEE\u6539\u5728\u7EDF\u8BA1\u4E0A\u4E0D\u53EF\u68C0\u6D4B\u3002'",
    "faq1_a:'Cryptoimg \u4F7F\u7528\u65B9\u5DEE\u8FC7\u6EE4\u50CF\u7D20\u4E2D\u7684 LSB \u9690\u5199\u672F\uFF0C\u914D\u5408\u5BC6\u94A5\u7F6E\u6362\u3002\u4FEE\u6539\u8BBE\u8BA1\u4E3A\u6700\u5C0F\u5316\u7EDF\u8BA1\u4F2A\u5F71 \u2014 \u88AB\u4FEE\u6539\u7684\u50CF\u7D20\u5728\u89C6\u89C9\u4E0A\u4E0E\u539F\u59CB\u56FE\u50CF\u76F8\u540C\u3002\u6CE8\u610F\uFF1A\u6CA1\u6709\u4EFB\u4F55\u9690\u5199\u672F\u80FD\u5728\u62E5\u6709\u539F\u59CB\u56FE\u50CF\u7684\u575A\u5B9A\u5BF9\u624B\u9762\u524D\u5B8C\u5168\u4E0D\u53EF\u68C0\u6D4B\u3002'"
  );
  
  fs.writeFileSync(file, content, 'utf-8');
  console.log(`Updated ${file}`);
}

// Also fix build-web-i18n.mjs
const buildFile = 'build-web-i18n.mjs';
if (fs.existsSync(buildFile)) {
  let b = fs.readFileSync(buildFile, 'utf-8');
  b = b.replace(/Statistically undetectable\./g, 'Designed to minimize statistical artifacts via adaptive pixel selection.');
  b = b.replace(/statistically undetectable/g, 'designed to minimize statistical artifacts');
  b = b.replace(/Статистически необнаружимо\./g, 'Минимизация статистических артефактов адаптивным выбором пикселей.');
  b = b.replace(/статистически необнаружимы/g, 'максимально минимизируют статистические артефакты');
  fs.writeFileSync(buildFile, b, 'utf-8');
  console.log(`Updated ${buildFile}`);
}

console.log('Done!');
