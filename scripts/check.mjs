import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(projectRoot, "_site");
const config = JSON.parse(await readFile(path.join(projectRoot, "site.config.json"), "utf8"));

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(target));
    else files.push(target);
  }
  return files;
}

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

const files = await walk(outputRoot);
const htmlFiles = files.filter(filename => filename.endsWith(".html"));
const errors = [];

for (const filename of htmlFiles) {
  const html = await readFile(filename, "utf8");
  if (html.includes("data-i18n")) errors.push(`${filename}: unresolved translation marker`);

  const references = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(match => match[1]);
  for (const reference of references) {
    if (/^(?:https?:|mailto:|tel:|#|data:|javascript:)/.test(reference)) continue;
    const clean = reference.split(/[?#]/, 1)[0];
    let target = clean.startsWith("/")
      ? path.join(outputRoot, clean.slice(1))
      : path.resolve(path.dirname(filename), clean);
    if (clean.endsWith("/")) target = path.join(target, "index.html");
    if (!await exists(target)) errors.push(`${filename}: missing local target ${reference}`);
  }
}

for (const language of config.languages) {
  for (const page of config.pages) {
    const filename = path.join(outputRoot, language, page.output);
    const html = await readFile(filename, "utf8");
    if (!html.includes(`<html lang="${language}">`)) errors.push(`${filename}: incorrect html lang`);
    if (!html.includes('rel="canonical"')) errors.push(`${filename}: missing canonical URL`);
    if (!html.includes('hreflang="x-default"')) errors.push(`${filename}: missing x-default alternate`);
  }
}

if (errors.length) {
  throw new Error(`Site validation failed:\n${errors.join("\n")}`);
}

console.log(`Validated ${htmlFiles.length} HTML files and all local references.`);
