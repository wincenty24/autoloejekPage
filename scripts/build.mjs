import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(projectRoot, "src");
const publicRoot = path.join(projectRoot, "public");
const outputRoot = path.join(projectRoot, "_site");
const config = JSON.parse(await readFile(path.join(projectRoot, "site.config.json"), "utf8"));
const usedTranslations = Object.fromEntries(config.languages.map(language => [language, new Set()]));
const assetVersions = {};

for (const filename of ["styles.css", "site.js"]) {
  const contents = await readFile(path.join(publicRoot, filename));
  assetVersions[filename] = createHash("sha256").update(contents).digest("hex").slice(0, 10);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function requireTranslation(dictionary, key, language) {
  if (!(key in dictionary)) {
    throw new Error(`Missing translation "${key}" for language "${language}"`);
  }
  usedTranslations[language].add(key);
  return dictionary[key];
}

async function loadDictionary(language) {
  const localeDirectory = path.join(sourceRoot, "locales", language);
  const filenames = (await readdir(localeDirectory)).filter(name => name.endsWith(".json")).sort();
  const dictionary = {};

  for (const filename of filenames) {
    const entries = JSON.parse(await readFile(path.join(localeDirectory, filename), "utf8"));
    for (const [key, value] of Object.entries(entries)) {
      if (key in dictionary) {
        throw new Error(`Duplicate translation "${key}" in language "${language}"`);
      }
      dictionary[key] = value;
    }
  }

  return dictionary;
}

function replaceTranslatedAttributes(html, dictionary, language, dataAttribute, targetAttribute) {
  const tagPattern = new RegExp(`<[^>]+\\s${dataAttribute}="([^"]+)"[^>]*>`, "g");

  return html.replace(tagPattern, tag => {
    const key = tag.match(new RegExp(`${dataAttribute}="([^"]+)"`))[1];
    const value = escapeHtml(requireTranslation(dictionary, key, language));
    let result = tag.replace(new RegExp(`\\s${dataAttribute}="[^"]+"`), "");
    const targetPattern = new RegExp(`\\s${targetAttribute}="[^"]*"`);

    if (targetPattern.test(result)) {
      return result.replace(targetPattern, ` ${targetAttribute}="${value}"`);
    }

    return result.replace(/>$/, ` ${targetAttribute}="${value}">`);
  });
}

function applyTranslations(template, dictionary, language) {
  let html = template;
  const elementPattern = /<([a-zA-Z][\w:-]*)([^>]*\sdata-i18n="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/g;

  html = html.replace(elementPattern, (_match, tagName, attributes, key) => {
    const translated = escapeHtml(requireTranslation(dictionary, key, language));
    const cleanAttributes = attributes.replace(/\sdata-i18n="[^"]+"/, "");
    return `<${tagName}${cleanAttributes}>${translated}</${tagName}>`;
  });
  html = replaceTranslatedAttributes(html, dictionary, language, "data-i18n-alt", "alt");
  html = replaceTranslatedAttributes(html, dictionary, language, "data-i18n-aria-label", "aria-label");

  const remaining = [...html.matchAll(/data-i18n(?:-alt|-aria-label)?="([^"]+)"/g)].map(match => match[1]);
  if (remaining.length) {
    throw new Error(`Unprocessed translation keys in ${language}: ${remaining.join(", ")}`);
  }

  return html;
}

function pageUrl(language, filename) {
  return filename === "index.html" ? `/${language}/` : `/${language}/${filename}`;
}

function makeLanguageOptions(page, language, dictionaries) {
  return config.languages.map(code => {
    const name = escapeHtml(requireTranslation(dictionaries[code], "name", code));
    const selected = code === language ? " selected" : "";
    return `<option value="../${code}/${page.output}"${selected}>${name}</option>`;
  }).join("");
}

function addMetadata(html, page, language, dictionary) {
  const canonical = new URL(pageUrl(language, page.output), config.baseUrl).href;
  const alternates = config.languages.map(code => {
    const href = new URL(pageUrl(code, page.output), config.baseUrl).href;
    return `<link rel="alternate" hreflang="${code}" href="${href}">`;
  });
  const fallback = new URL(pageUrl(config.defaultLanguage, page.output), config.baseUrl).href;
  alternates.push(`<link rel="alternate" hreflang="x-default" href="${fallback}">`);

  html = html.replace(/<html\b[^>]*>/, `<html lang="${language}">`);
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(requireTranslation(dictionary, page.titleKey, language))}</title>`);
  html = html.replace("</head>", `<meta name="description" content="${escapeHtml(requireTranslation(dictionary, page.descriptionKey, language))}"><link rel="canonical" href="${canonical}">${alternates.join("")}</head>`);
  return html;
}

function adjustAssetPaths(html) {
  return html
    .replaceAll('href="styles.css"', `href="../styles.css?v=${assetVersions["styles.css"]}"`)
    .replaceAll('href="assets/', 'href="../assets/')
    .replaceAll('src="assets/', 'src="../assets/')
    .replaceAll('src="site.js"', `src="../site.js?v=${assetVersions["site.js"]}"`);
}

function orderSections(html) {
  const containerPattern = /(<section\b[^>]*\sdata-ordered-sections[^>]*>)([\s\S]*?)(<\/section>)/g;
  const sectionPattern = /<details\b[^>]*\sdata-section-order="(\d+)"[^>]*>[\s\S]*?<\/details>/g;

  return html.replace(containerPattern, (container, openingTag, content, closingTag) => {
    const sections = [...content.matchAll(sectionPattern)].map(match => ({
      html: match[0].replace(/\sdata-section-order="\d+"/, ""),
      order: Number(match[1])
    }));

    if (!sections.length) return container;
    const remainingContent = content.replace(sectionPattern, "").trim();
    if (remainingContent) throw new Error("Ordered section container contains unsupported content");

    const cleanOpeningTag = openingTag.replace(/\sdata-ordered-sections/, "");
    const orderedContent = sections
      .sort((first, second) => first.order - second.order)
      .map(section => `      ${section.html}`)
      .join("\n");
    return `${cleanOpeningTag}\n${orderedContent}\n    ${closingTag}`;
  });
}

function makeRedirect(target, canonical) {
  return `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Autolejek</title><link rel="canonical" href="${canonical}"><meta http-equiv="refresh" content="0;url=${target}"><script>location.replace(${JSON.stringify(target)});</script></head><body><p><a href="${target}">Przejdź do strony Autolejek</a></p></body></html>\n`;
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });
await cp(publicRoot, outputRoot, { recursive: true });

const dictionaries = {};
for (const language of config.languages) {
  dictionaries[language] = await loadDictionary(language);
}

const referenceKeys = Object.keys(dictionaries[config.defaultLanguage]).sort();
for (const language of config.languages) {
  const languageKeys = Object.keys(dictionaries[language]).sort();
  const missing = referenceKeys.filter(key => !languageKeys.includes(key));
  const extra = languageKeys.filter(key => !referenceKeys.includes(key));
  if (missing.length || extra.length) {
    throw new Error(`Translation key mismatch for "${language}". Missing: ${missing.join(", ") || "none"}; extra: ${extra.join(", ") || "none"}`);
  }
}

for (const page of config.pages) {
  const template = await readFile(path.join(sourceRoot, "pages", page.source), "utf8");

  for (const language of config.languages) {
    const dictionary = dictionaries[language];
    let html = applyTranslations(template, dictionary, language);
    html = orderSections(html);
    html = addMetadata(html, page, language, dictionary);
    html = html.replace(/<select id="language"([^>]*)><\/select>/, `<select id="language"$1>${makeLanguageOptions(page, language, dictionaries)}</select>`);
    html = adjustAssetPaths(html).replaceAll('src="i18n.js"', `src="../site.js?v=${assetVersions["site.js"]}"`);

    const destination = path.join(outputRoot, language, page.output);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, html);
  }

  const defaultTarget = page.output === "index.html" ? `${config.defaultLanguage}/` : `${config.defaultLanguage}/${page.output}`;
  const canonical = new URL(pageUrl(config.defaultLanguage, page.output), config.baseUrl).href;
  await writeFile(path.join(outputRoot, page.output), makeRedirect(defaultTarget, canonical));
}

const sitemapEntries = config.languages.flatMap(language => config.pages.map(page => {
  const url = new URL(pageUrl(language, page.output), config.baseUrl).href;
  return `  <url><loc>${escapeHtml(url)}</loc></url>`;
}));
await writeFile(path.join(outputRoot, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.join("\n")}\n</urlset>\n`);

for (const language of config.languages) {
  const unused = Object.keys(dictionaries[language]).filter(key => !usedTranslations[language].has(key));
  if (unused.length) {
    throw new Error(`Unused translations for "${language}": ${unused.join(", ")}`);
  }
}

console.log(`Built ${config.pages.length * config.languages.length} localized pages in _site/`);
