import React, { useState } from 'react';
import { X, BookOpen, Lock, Unlock, Layers, BarChart3, Cpu, Heart, Shield, ChevronDown, ChevronRight } from 'lucide-react';
import { Language } from '../types';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

const GUIDE: Record<Language, {
  title: string;
  sections: { heading: string; icon: string; items: string[] }[];
}> = {
  ru: {
    title: 'Полное руководство по Cryptoimg',
    sections: [
      { heading: 'Обзор интерфейса', icon: 'ui', items: [
        'Верхняя панель — логотип, переключатель языка, индикатор шифрования, бенчмарк и кнопка доната.',
        'Левая панель — рабочие пространства (вкладки), баннер донатов со списком адресов и QR-кодами, статус безопасности AES-256-GCM / Argon2id / Reed-Solomon, кнопка очистки ОЗУ.',
        'Центральная панель — основная рабочая область текущего инструмента.',
        'Правая панель — предпросмотр зашифрованного фото-ключа, кнопка скачивания, внутренний аудит целостности (self-test).',
        'Нижняя панель — строка состояния: алгоритмы шифрования, параметры Argon2, статус памяти.'
      ]},
      { heading: 'Зашифровать (Encode)', icon: 'encode', items: [
        '1. Выберите изображение-контейнер (PNG, JPG, BMP, WebP, TIFF, AVIF — JPEG конвертируется автоматически).',
        '2. Введите секретные данные: текст, seed-фразу (12/24 слова) или бинарный файл до 50 МБ.',
        '3. Установите ПИН-код (8-11 цифр) или парольную фразу (от 12 символов).',
        '4. Выберите формат выходного файла: PNG (рекомендуется), WebP или AVIF — все без потерь.',
        '5. Нажмите «Зашифровать и создать фото-ключ». Приложение выполнит: сжатие → шифрование AES-256-GCM → коррекцию ошибок Reed-Solomon → встраивание в пиксели → 5-ступенчатый аудит целостности.',
        '6. Результат появится в правой панели — предпросмотр и кнопка скачивания.'
      ]},
      { heading: 'Извлечь (Decode)', icon: 'decode', items: [
        '1. Загрузите файл фото-ключа (PNG/WebP/AVIF) с зашифрованными данными.',
        '2. Введите тот же ПИН-код или парольную фразу, что использовались при шифровании.',
        '3. Нажмите «Извлечь и расшифровать». Приложение автоматически определит формат (v5.1 AEAD или v4.0 Legacy).',
        '4. Расшифрованные данные появятся внизу — текст можно скопировать, файл — скачать.'
      ]},
      { heading: 'Инспектор стего', icon: 'inspector', items: [
        'Загрузите изображение для анализа разрешения, вариативности текстуры и расчёта безопасной ёмкости.',
        'Нажмите кнопки RGB / Red / Green / Blue / 2-LSB для просмотра отдельных цветовых каналов и шума младших бит.',
        'Показывает сырую и безопасную (с ECC) ёмкость для скрытия данных.'
      ]},
      { heading: 'Бенчмарк Argon2', icon: 'benchmark', items: [
        'Запускает тест производительности Argon2id для калибровки параметров KDF под ваш процессор.',
        'Автоматически подбирает объём памяти (RAM) для целевого времени хеширования ~1 сек.',
        'Параметры (память, итерации, потоки) применяются при следующем шифровании/расшифровке.'
      ]},
      { heading: 'Альбом (для больших файлов)', icon: 'album', items: [
        'Разбейте большой файл на части и спрячьте в несколько изображений.',
        'Кодирование: выберите 2+ изображения, введите ПИН — файл автоматически разделится на части.',
        'Извлечение: загрузите все изображения альбома, введите ПИН — части собираются автоматически.',
        'Каждая часть шифруется независимо со своим salt/nonce.'
      ]},
      { heading: 'Безопасность', icon: 'security', items: [
        'Все вычисления происходят локально в браузере. Данные не покидают устройство.',
        'Шифрование: AES-256-GCM (аутентифицированное), ключ: Argon2id (RFC 9106) → HKDF-SHA256.',
        'Коррекция ошибок: Reed-Solomon RS(255, 191) — защищает от модификаций изображения.',
        'Кнопка «Sanitize RAM» обнуляет все криптографические ключи и чувствительные данные в памяти.',
        'ПИН-код не хранится — он используется только для вывода ключа через Argon2id.'
      ]}
    ]
  },
  en: {
    title: 'Complete Cryptoimg Guide',
    sections: [
      { heading: 'Interface Overview', icon: 'ui', items: [
        'Top bar — logo, language switcher, encryption indicator, benchmark badge, and donate button.',
        'Left panel — workspaces (tabs), donate banner with wallet addresses and QR codes, security status (AES-256-GCM / Argon2id / Reed-Solomon), RAM sanitize button.',
        'Center panel — main working area for the active tool.',
        'Right panel — encrypted photo key preview, download button, internal integrity audit (self-test).',
        'Bottom bar — status bar: encryption algorithms, Argon2 parameters, memory status.'
      ]},
      { heading: 'Hide Secret (Encode)', icon: 'encode', items: [
        '1. Select a cover image (PNG, JPG, BMP, WebP, TIFF, AVIF — JPEG auto-converts to lossless).',
        '2. Enter secret data: text, seed phrase (12/24 words), or binary file up to 50 MB.',
        '3. Set a PIN (8-11 digits) or passphrase (12+ characters).',
        '4. Choose output format: PNG (recommended), WebP, or AVIF — all lossless.',
        '5. Click "Encrypt & Build Photo Key". The app performs: compress → AES-256-GCM encrypt → Reed-Solomon ECC → embed in pixels → 5-stage integrity audit.',
        '6. Result appears in the right panel — preview and download button.'
      ]},
      { heading: 'Extract Secret (Decode)', icon: 'decode', items: [
        '1. Load the photo key image (PNG/WebP/AVIF) with hidden data.',
        '2. Enter the same PIN or passphrase used during encryption.',
        '3. Click "Extract & Decrypt". The app auto-detects format (v5.1 AEAD or v4.0 Legacy).',
        '4. Decrypted data appears below — copy text or download file.'
      ]},
      { heading: 'Stego Inspector', icon: 'inspector', items: [
        'Load an image to analyze resolution, texture variance, and safe steganographic capacity.',
        'Click RGB / Red / Green / Blue / 2-LSB buttons to view individual color channels and LSB noise.',
        'Shows raw and safe (with ECC) capacity for data hiding.'
      ]},
      { heading: 'Argon2 Benchmark', icon: 'benchmark', items: [
        'Runs a performance test to calibrate Argon2id KDF parameters for your CPU.',
        'Automatically selects memory (RAM) for ~1 second hash computation target.',
        'Parameters (memory, iterations, threads) are applied during next encrypt/decrypt.'
      ]},
      { heading: 'Album Mode (Large Files)', icon: 'album', items: [
        'Split a large file across multiple carrier images.',
        'Encode: select 2+ images, enter PIN — file is automatically chunked.',
        'Decode: load all album images, enter PIN — parts are reassembled automatically.',
        'Each chunk is independently encrypted with its own salt/nonce.'
      ]},
      { heading: 'Security', icon: 'security', items: [
        'All processing is local in your browser. Data never leaves your device.',
        'Encryption: AES-256-GCM (authenticated), key: Argon2id (RFC 9106) → HKDF-SHA256.',
        'Error correction: Reed-Solomon RS(255, 191) — protects against image modifications.',
        '"Sanitize RAM" button zeros out all cryptographic keys and sensitive data in memory.',
        'PIN is never stored — it is only used to derive the key via Argon2id.'
      ]}
    ]
  },
  es: {
    title: 'Guía Completa de Cryptoimg',
    sections: [
      { heading: 'Descripción de la Interfaz', icon: 'ui', items: [
        'Barra superior — logo, selector de idioma, indicador de cifrado, badge de benchmark y botón de donación.',
        'Panel izquierdo — espacios de trabajo (pestañas), banner de donación con direcciones y códigos QR, estado de seguridad, botón de limpieza de RAM.',
        'Panel central — área de trabajo principal de la herramienta activa.',
        'Panel derecho — vista previa de la foto-llave cifrada, botón de descarga, auditoría interna de integridad.',
        'Barra inferior — estado: algoritmos de cifrado, parámetros Argon2, estado de memoria.'
      ]},
      { heading: 'Ocultar Secreto (Encode)', icon: 'encode', items: [
        '1. Seleccione imagen portadora (PNG, JPG, BMP, WebP, TIFF, AVIF — JPEG se convierte automáticamente).',
        '2. Ingrese datos secretos: texto, frase semilla (12/24 palabras) o archivo binario hasta 50 MB.',
        '3. Establezca PIN (8-11 dígitos) o frase contraseña (12+ caracteres).',
        '4. Elija formato: PNG (recomendado), WebP o AVIF — todos sin pérdidas.',
        '5. Haga clic en "Cifrar y Crear Foto-Llave". La app ejecuta: comprimir → cifrar AES-256-GCM → Reed-Solomon → incrustar → auditoría de 5 etapas.',
        '6. El resultado aparece en el panel derecho — vista previa y botón de descarga.'
      ]},
      { heading: 'Extraer Secreto (Decode)', icon: 'decode', items: [
        '1. Cargue la foto-llave (PNG/WebP/AVIF) con datos ocultos.',
        '2. Ingrese el mismo PIN o frase contraseña usado al cifrar.',
        '3. Haga clic en "Extraer y Descifrar". Detección automática de formato.',
        '4. Los datos descifrados aparecen abajo — copiar texto o descargar archivo.'
      ]},
      { heading: 'Inspector Stego', icon: 'inspector', items: [
        'Cargue una imagen para analizar resolución, varianza de textura y capacidad segura.',
        'Botones RGB / Red / Green / Blue / 2-LSB para ver canales de color y ruido LSB.',
        'Muestra capacidad bruta y segura (con ECC) para ocultar datos.'
      ]},
      { heading: 'Benchmark Argon2', icon: 'benchmark', items: [
        'Prueba de rendimiento para calibrar los parámetros KDF Argon2id.',
        'Selecciona automáticamente la memoria para ~1 segundo de cómputo.',
        'Los parámetros se aplican en el siguiente cifrado/descifrado.'
      ]},
      { heading: 'Modo Álbum (Archivos Grandes)', icon: 'album', items: [
        'Divida un archivo grande en varias imágenes portadoras.',
        'Cifrado: seleccione 2+ imágenes, ingrese PIN — el archivo se divide automáticamente.',
        'Extracción: cargue todas las imágenes del álbum, ingrese PIN — las partes se reensamblan.',
        'Cada parte se cifra independientemente con su propio salt/nonce.'
      ]},
      { heading: 'Seguridad', icon: 'security', items: [
        'Todo el procesamiento es local. Los datos nunca salen de su dispositivo.',
        'Cifrado: AES-256-GCM (autenticado), clave: Argon2id (RFC 9106) → HKDF-SHA256.',
        'Corrección de errores: Reed-Solomon RS(255, 191).',
        'El botón "Sanitizar RAM" pone a cero todas las claves criptográficas en memoria.',
        'El PIN nunca se almacena — solo se usa para derivar la clave.'
      ]}
    ]
  },
  de: {
    title: 'Vollständiger Cryptoimg-Leitfaden',
    sections: [
      { heading: 'Oberflächenübersicht', icon: 'ui', items: [
        'Obere Leiste — Logo, Sprachumschalter, Verschlüsselungsindikator, Benchmark-Badge, Spenden-Button.',
        'Linke Leiste — Arbeitsbereiche (Tabs), Spendenbanner mit Wallet-Adressen und QR-Codes, Sicherheitsstatus, RAM-Bereinigung.',
        'Mittlere Leiste — Hauptarbeitsbereich des aktuellen Tools.',
        'Rechte Leiste — Vorschau des verschlüsselten Foto-Keys, Download-Button, Integritäts-Audit.',
        'Untere Leiste — Statusleiste: Verschlüsselungsalgorithmen, Argon2-Parameter, Speicherstatus.'
      ]},
      { heading: 'Geheimnis verbergen (Encode)', icon: 'encode', items: [
        '1. Trägerbild wählen (PNG, JPG, BMP, WebP, TIFF, AVIF — JPEG wird automatisch konvertiert).',
        '2. Geheimdaten eingeben: Text, Seed-Phrase (12/24 Wörter) oder Binärdatei bis 50 MB.',
        '3. PIN (8-11 Ziffern) oder Passphrase (12+ Zeichen) festlegen.',
        '4. Ausgabeformat wählen: PNG (empfohlen), WebP oder AVIF — alle verlustfrei.',
        '5. Auf "Verschlüsseln & Foto-Key erstellen" klicken. Ablauf: Komprimieren → AES-256-GCM → Reed-Solomon → Einbetten → 5-Stufen-Audit.',
        '6. Ergebnis in der rechten Leiste — Vorschau und Download-Button.'
      ]},
      { heading: 'Geheimnis extrahieren (Decode)', icon: 'decode', items: [
        '1. Foto-Key-Bild laden (PNG/WebP/AVIF) mit versteckten Daten.',
        '2. Gleiche PIN oder Passphrase wie beim Verschlüsseln eingeben.',
        '3. Auf "Extrahieren & Entschlüsseln" klicken. Automatische Formaterkennung.',
        '4. Entschlüsselte Daten werden angezeigt — Text kopieren oder Datei herunterladen.'
      ]},
      { heading: 'Stego-Inspektor', icon: 'inspector', items: [
        'Bild laden für Auflösungs-, Texturvarianz- und Kapazitätsanalyse.',
        'RGB / Red / Green / Blue / 2-LSB Buttons für Farbkanäle und LSB-Rauschen.',
        'Zeigt Roh- und sichere Kapazität (mit ECC) für Datenversteckung.'
      ]},
      { heading: 'Argon2 Benchmark', icon: 'benchmark', items: [
        'Leistungstest zur Kalibrierung der Argon2id KDF-Parameter.',
        'Wählt automatisch Speicher für ~1 Sekunde Berechnungszeit.',
        'Parameter werden bei nächster Ver-/Entschlüsselung angewendet.'
      ]},
      { heading: 'Album-Modus (große Dateien)', icon: 'album', items: [
        'Große Datei auf mehrere Trägerbilder aufteilen.',
        'Kodieren: 2+ Bilder wählen, PIN eingeben — Datei wird automatisch aufgeteilt.',
        'Dekodieren: Alle Album-Bilder laden, PIN eingeben — Teile werden zusammengesetzt.',
        'Jeder Block wird unabhängig mit eigenem Salt/Nonce verschlüsselt.'
      ]},
      { heading: 'Sicherheit', icon: 'security', items: [
        'Alle Verarbeitung lokal im Browser. Daten verlassen das Gerät nie.',
        'Verschlüsselung: AES-256-GCM (authentifiziert), Schlüssel: Argon2id (RFC 9106) → HKDF-SHA256.',
        'Fehlerkorrektur: Reed-Solomon RS(255, 191).',
        '"RAM bereinigen" setzt alle kryptografischen Schlüssel auf Null.',
        'PIN wird nie gespeichert — nur zur Schlüsselableitung verwendet.'
      ]}
    ]
  },
  fr: {
    title: 'Guide Complet de Cryptoimg',
    sections: [
      { heading: "Aperçu de l'Interface", icon: 'ui', items: [
        'Barre supérieure — logo, sélecteur de langue, indicateur de chiffrement, badge benchmark, bouton don.',
        'Panneau gauche — espaces de travail, bannière de dons avec adresses et QR codes, état de sécurité, bouton nettoyage RAM.',
        'Panneau central — zone de travail principale de l\'outil actif.',
        'Panneau droit — aperçu de la photo-clé chiffrée, bouton de téléchargement, audit d\'intégrité.',
        'Barre inférieure — état : algorithmes, paramètres Argon2, état mémoire.'
      ]},
      { heading: 'Masquer un Secret (Encoder)', icon: 'encode', items: [
        '1. Sélectionner l\'image support (PNG, JPG, BMP, WebP, TIFF, AVIF — JPEG converti automatiquement).',
        '2. Entrer les données secrètes : texte, phrase semence (12/24 mots) ou fichier binaire jusqu\'à 50 Mo.',
        '3. Définir un PIN (8-11 chiffres) ou phrase secrète (12+ caractères).',
        '4. Choisir le format : PNG (recommandé), WebP ou AVIF — tous sans perte.',
        '5. Cliquer sur "Chiffrer et Créer la Photo-Clé". Processus : compresser → AES-256-GCM → Reed-Solomon → intégrer → audit 5 étapes.',
        '6. Résultat dans le panneau droit — aperçu et bouton de téléchargement.'
      ]},
      { heading: 'Extraire un Secret (Décoder)', icon: 'decode', items: [
        '1. Charger l\'image photo-clé (PNG/WebP/AVIF) avec données cachées.',
        '2. Entrer le même PIN ou phrase secrète utilisé lors du chiffrement.',
        '3. Cliquer sur "Extraire et Déchiffrer". Détection automatique du format.',
        '4. Données déchiffrées affichées — copier le texte ou télécharger le fichier.'
      ]},
      { heading: 'Inspecteur Stego', icon: 'inspector', items: [
        'Charger une image pour analyser résolution, variance de texture et capacité.',
        'Boutons RGB / Red / Green / Blue / 2-LSB pour les canaux de couleur et bruit LSB.',
        'Affiche la capacité brute et sûre (avec ECC) pour le masquage de données.'
      ]},
      { heading: 'Benchmark Argon2', icon: 'benchmark', items: [
        'Test de performance pour calibrer les paramètres Argon2id.',
        'Sélectionne automatiquement la mémoire pour ~1 seconde de calcul.',
        'Les paramètres sont appliqués lors du prochain chiffrement/déchiffrement.'
      ]},
      { heading: 'Mode Album (Gros Fichiers)', icon: 'album', items: [
        'Diviser un gros fichier en plusieurs images support.',
        'Encodage : sélectionner 2+ images, entrer PIN — le fichier est découpé automatiquement.',
        'Décodage : charger toutes les images de l\'album, entrer PIN — les parties sont reconstituées.',
        'Chaque bloc est chiffré indépendamment avec son propre salt/nonce.'
      ]},
      { heading: 'Sécurité', icon: 'security', items: [
        'Tout le traitement est local dans le navigateur. Les données ne quittent jamais l\'appareil.',
        'Chiffrement : AES-256-GCM (authentifié), clé : Argon2id (RFC 9106) → HKDF-SHA256.',
        'Correction d\'erreurs : Reed-Solomon RS(255, 191).',
        '"Nettoyer la RAM" remet toutes les clés cryptographiques à zéro.',
        'Le PIN n\'est jamais stocké — utilisé uniquement pour dériver la clé.'
      ]}
    ]
  },
  zh: {
    title: 'Cryptoimg 完整使用指南',
    sections: [
      { heading: '界面概览', icon: 'ui', items: [
        '顶部栏 — 标志、语言切换、加密指示器、基准测试徽章、捐赠按钮。',
        '左侧面板 — 工作区（标签页）、捐赠横幅（钱包地址和二维码）、安全状态、内存清理按钮。',
        '中间面板 — 当前工具的主工作区域。',
        '右侧面板 — 加密照片密钥预览、下载按钮、内部完整性审计。',
        '底部栏 — 状态栏：加密算法、Argon2 参数、内存状态。'
      ]},
      { heading: '隐藏秘密（编码）', icon: 'encode', items: [
        '1. 选择载体图片（PNG、JPG、BMP、WebP、TIFF、AVIF — JPEG 自动转换为无损格式）。',
        '2. 输入秘密数据：文本、助记词（12/24 个词）或最大 50MB 的二进制文件。',
        '3. 设置 PIN 码（8-11 位数字）或密码短语（12+ 个字符）。',
        '4. 选择输出格式：PNG（推荐）、WebP 或 AVIF — 全部无损。',
        '5. 点击"加密并生成照片密钥"。流程：压缩 → AES-256-GCM 加密 → Reed-Solomon 纠错 → 嵌入像素 → 5 阶段审计。',
        '6. 结果显示在右侧面板 — 预览和下载按钮。'
      ]},
      { heading: '提取秘密（解码）', icon: 'decode', items: [
        '1. 加载包含隐藏数据的照片密钥图片（PNG/WebP/AVIF）。',
        '2. 输入与加密时相同的 PIN 码或密码短语。',
        '3. 点击"提取并解密"。自动检测格式（v5.1 AEAD 或 v4.0 旧版）。',
        '4. 解密数据显示在下方 — 复制文本或下载文件。'
      ]},
      { heading: '隐写检查器', icon: 'inspector', items: [
        '加载图片以分析分辨率、纹理方差和安全容量。',
        'RGB / Red / Green / Blue / 2-LSB 按钮用于查看各颜色通道和 LSB 噪声。',
        '显示原始容量和安全容量（含 ECC）。'
      ]},
      { heading: 'Argon2 基准测试', icon: 'benchmark', items: [
        '运行性能测试以校准 Argon2id KDF 参数。',
        '自动选择内存以达到约 1 秒的计算目标。',
        '参数将在下次加密/解密时应用。'
      ]},
      { heading: '相册模式（大文件）', icon: 'album', items: [
        '将大文件拆分到多个载体图片中。',
        '编码：选择 2+ 张图片，输入 PIN — 文件自动分块。',
        '解码：加载所有相册图片，输入 PIN — 各部分自动重组。',
        '每个分块独立加密，使用各自的 salt/nonce。'
      ]},
      { heading: '安全', icon: 'security', items: [
        '所有处理均在浏览器本地完成。数据永不离开设备。',
        '加密：AES-256-GCM（认证加密），密钥：Argon2id (RFC 9106) → HKDF-SHA256。',
        '纠错：Reed-Solomon RS(255, 191)。',
        '"清理 RAM" 按钮将所有加密密钥和敏感数据清零。',
        'PIN 码永不存储 — 仅用于通过 Argon2id 派生密钥。'
      ]}
    ]
  }
};

const SECTION_ICONS: Record<string, React.ReactNode> = {
  ui: <BookOpen className="w-4 h-4 text-slate-400" />,
  encode: <Lock className="w-4 h-4 text-emerald-400" />,
  decode: <Unlock className="w-4 h-4 text-blue-400" />,
  inspector: <BarChart3 className="w-4 h-4 text-purple-400" />,
  benchmark: <Cpu className="w-4 h-4 text-indigo-400" />,
  album: <Layers className="w-4 h-4 text-amber-400" />,
  security: <Shield className="w-4 h-4 text-emerald-400" />,
};

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose, lang }) => {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 0: true });

  if (!isOpen) return null;

  const guide = GUIDE[lang] || GUIDE.en;
  const toggle = (i: number) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl max-h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-100">{guide.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {guide.sections.map((section, i) => (
            <div key={i} className="border border-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center gap-2.5 px-4 py-3 bg-slate-950/60 hover:bg-slate-900 transition-colors cursor-pointer"
              >
                {SECTION_ICONS[section.icon]}
                <span className="text-xs font-bold text-slate-200 flex-1 text-left">{section.heading}</span>
                {expanded[i] ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>
              {expanded[i] && (
                <div className="px-4 py-3 space-y-1.5 bg-slate-950/30">
                  {section.items.map((item, j) => (
                    <p key={j} className="text-[11px] text-slate-400 leading-relaxed pl-6 relative">
                      <span className="absolute left-0 text-slate-600">{j + 1}.</span>
                      {item}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
