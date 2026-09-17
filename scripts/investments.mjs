import { validateProvenance } from "./image-provenance.mjs";
import { cp, mkdir, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const escape = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
const slug = /^[a-z0-9][a-z0-9_-]*$/;

export async function loadInvestments(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const projects = [];
  const ids = new Set();
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory()) continue;
    const directory = path.join(root, entry.name);
    const data = JSON.parse(await readFile(path.join(directory, "data.json"), "utf8"));
    const fail = message => { throw new Error(`Investment ${entry.name}: ${message}`); };
    if (!slug.test(entry.name) || typeof data.id !== "string" || !slug.test(data.id)) fail("folder and id must use lowercase letters, digits, hyphens or underscores");
    if (ids.has(data.id)) fail(`duplicate id ${data.id}`);
    ids.add(data.id);
    if (data.draft !== undefined && typeof data.draft !== "boolean") fail("draft must be a boolean");
    if (data.draft) continue;
    if (typeof data.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data.date) || !Number.isFinite(Date.parse(data.date)) || new Date(data.date).toISOString().slice(0, 10) !== data.date) fail("date must be a valid YYYY-MM-DD date");
    const language = data.language ?? "pl";
    if (typeof language !== "string" || !/^[a-z]{2}(?:-[A-Za-z]{2})?$/.test(language)) fail("invalid content language");
    const validateText = text => {
      if (typeof text.title !== "string" || !text.title.trim() || typeof text.description?.short !== "string" || !text.description.short.trim() || !Array.isArray(text.description.content)) fail("title, description.short and description.content are required");
      for (const block of text.description.content) {
        if (typeof block === "string" && block.trim()) continue;
        if (!block || typeof block !== "object" || Array.isArray(block)) fail("invalid content block");
        if (block.type === "text" && typeof block.text === "string" && block.text.trim()) continue;
        if (block.type === "image" && block.width !== undefined && (!Number.isSafeInteger(block.width) || block.width <= 0)) fail("image width must be a positive integer in pixels");
        if (block.type === "image" && typeof block.src === "string" && typeof block.alt === "string" && block.alt.trim() && (block.caption === undefined || typeof block.caption === "string")) continue;
        fail("content blocks require text, or image src, alt and an optional caption");
      }
    };
    validateText(data);
    if (data.imageProvenance !== undefined) {
      if (!data.imageProvenance || typeof data.imageProvenance !== "object" || Array.isArray(data.imageProvenance)) fail("imageProvenance must be an object");
      for (const [filename, metadata] of Object.entries(data.imageProvenance)) {
        if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*\.(?:png|jpe?g|webp|avif)$/i.test(filename)) fail("invalid imageProvenance filename");
        validateProvenance(metadata);
      }
    }
    if (data.translations !== undefined && (!data.translations || typeof data.translations !== "object" || Array.isArray(data.translations))) fail("translations must be an object");
    for (const translation of Object.values(data.translations ?? {})) {
      if (!translation || typeof translation !== "object") fail("invalid translation");
      validateText(translation);
    }
    const gallery = data.gallery ?? [];
    if (!Array.isArray(gallery)) fail("gallery must be an array of filenames");
    const coverImage = data.coverImage ?? "cover.png";
    for (const filename of investmentImages({ ...data, coverImage, gallery })) {
      if (typeof filename !== "string" || !/^[a-zA-Z0-9][a-zA-Z0-9_.-]*\.(?:png|jpe?g|webp|avif)$/i.test(filename)) fail("images must be local PNG, JPG, WebP or AVIF filenames");
      if (!(await stat(path.join(directory, filename))).isFile()) fail(`missing image ${filename}`);
    }
    projects.push({ ...data, language, gallery, coverImage, directory, folder: entry.name });
  }
  return projects.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}

function investmentImages(project) {
  const texts = [project, ...Object.values(project.translations ?? {})];
  const inlineImages = texts.flatMap(text => text.description.content.filter(block => block?.type === "image").map(block => block.src));
  return new Set([project.coverImage, ...project.gallery, ...inlineImages]);
}

export async function copyInvestmentImages(projects, outputRoot) {
  for (const project of projects) {
    const destination = path.join(outputRoot, "assets", "investments", project.folder);
    await mkdir(destination, { recursive: true });
    for (const filename of investmentImages(project)) {
      await cp(path.join(project.directory, filename), path.join(destination, filename));
    }
  }
}

export function renderInvestments(projects, language) {
  const pl = language === "pl";
  if (!projects.length) return `<div class="projects-empty"><span class="eyebrow">${pl ? "Wkrótce" : "Coming soon"}</span><h2>${pl ? "Każda instalacja ma swoją historię" : "Every installation has a story"}</h2><p>${pl ? "Przygotowujemy zdjęcia i opisy zastosowań Autolejka. Wróć tutaj, aby poznać kolejne realizacje." : "We’re preparing photos and stories of Autolejek in use. Check back to discover our installations."}</p><a class="project-contact" href="contact.html">${pl ? "Porozmawiajmy o Twojej instalacji" : "Let’s talk about your installation"}<span aria-hidden="true"> ↗</span></a></div>`;
  return `<div class="projects-grid">${projects.map(project => {
    const { text, contentLanguage } = investmentText(project, language);
    return `<article class="project-card" id="${escape(project.id)}">
      <a class="project-card-link" href="${investmentFilename(project)}" lang="${escape(contentLanguage)}">
        <div class="project-cover"><img src="${investmentAsset(project, project.coverImage)}" alt="" loading="lazy" width="1200" height="675"></div>
        <div class="project-copy"><h2>${escape(text.title)}</h2><span aria-hidden="true">↗</span></div>
      </a></article>`;
  }).join("")}</div>`;
}

export function investmentFilename(project) {
  return `project-${project.id}.html`;
}

export function investmentText(project, language) {
  const translation = project.translations?.[language];
  return { text: translation ?? project, contentLanguage: translation ? language : project.language };
}

function investmentAsset(project, filename) {
  return `assets/investments/${project.folder}/${encodeURIComponent(filename)}`;
}

function renderContent(project, blocks) {
  return blocks.map(block => {
    if (typeof block === "string") return `<p>${escape(block)}</p>`;
    if (block.type === "text") return `<p>${escape(block.text)}</p>`;
    return `<figure class="project-inline-image"${block.width === undefined ? "" : ` style="max-width:${block.width}px"`}><a href="${investmentAsset(project, block.src)}"><img src="${investmentAsset(project, block.src)}" alt="${escape(block.alt)}" loading="lazy"></a>${block.caption ? `<figcaption>${escape(block.caption)}</figcaption>` : ""}</figure>`;
  }).join("");
}

export function renderInvestment(project, language) {
  const { text, contentLanguage } = investmentText(project, language);
  const back = `<a class="project-back" href="projects.html#${escape(project.id)}"><span aria-hidden="true">←</span> ${language === "pl" ? "Wróć do projektów" : "Back to Projects"}</a>`;
  const date = new Intl.DateTimeFormat(language, { dateStyle: "long", timeZone: "UTC" }).format(new Date(project.date));
  return `<main class="project-page">
    ${back}
    <article>
      <header class="project-heading"><time datetime="${project.date}">${escape(date)}</time><h1 lang="${escape(contentLanguage)}">${escape(text.title)}</h1><p class="lead" lang="${escape(contentLanguage)}">${escape(text.description.short)}</p></header>
      <img class="project-hero-image" src="${investmentAsset(project, project.coverImage)}" alt="${escape(text.title)}" lang="${escape(contentLanguage)}" width="1200" height="675">
      <div class="project-description" lang="${escape(contentLanguage)}">${renderContent(project, text.description.content)}</div>
      ${project.gallery.length ? `<div class="project-gallery">${project.gallery.map((filename, index) => `<a href="${investmentAsset(project, filename)}"><img src="${investmentAsset(project, filename)}" alt="${escape(text.title)} — ${index + 1}" lang="${escape(contentLanguage)}" loading="lazy" width="1200" height="900"></a>`).join("")}</div>` : ""}
    </article>
    ${back}
  </main>`;
}
