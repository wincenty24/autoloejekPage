import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const kinds = new Set(["original", "ai-generated", "ai-edited", "pexels", "screenshot-diagram"]);
export function validateProvenance(value) {
  if (!value || typeof value !== "object" || !kinds.has(value.kind)) throw new Error("Invalid image provenance kind");
  if (value.editDetails !== undefined && value.editDetails !== "color-correction") throw new Error("Unsupported image editDetails");
}
export function provenanceLabel(value, language) {
  if (!value || value.kind === "original") return "";
  const pl = language === "pl";
  switch (value.kind) {
    case "ai-generated": return pl ? "Ilustracja wygenerowana przy użyciu AI" : "AI-generated illustration";
    case "ai-edited": return value.editDetails === "color-correction"
      ? ""
      : (pl ? "Obraz zmodyfikowany przy użyciu AI" : "AI-edited image");
    case "pexels": return "";
    case "screenshot-diagram": return pl ? "Ilustracja z dokumentacji producenta" : "Illustration from manufacturer documentation";
    default: throw new Error("Unknown image provenance kind");
  }
}

export async function buildProvenanceMap(publicRoot, projects, manifest) {
  const byHash = new Map(manifest.images.filter(item => item.kind !== "removed" && item.kind !== "unclassified").map(item => [item.sha256, item]));
  const result = new Map();
  async function add(filename, asset, explicit) {
    const digest = createHash("sha256").update(await readFile(filename)).digest("hex");
    const metadata = explicit ?? byHash.get(digest);
    if (metadata) { validateProvenance(metadata); result.set(asset, metadata); }
  }
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(filename);
      else if (/\.(png|jpe?g|webp|avif)$/i.test(entry.name)) await add(filename, path.relative(publicRoot, filename).split(path.sep).join("/"));
    }
  }
  await walk(path.join(publicRoot, "assets"));
  for (const project of projects) {
    const versions = [project, ...Object.values(project.translations ?? {})];
    const filenames = new Set([project.coverImage, ...project.gallery, ...versions.flatMap(v => v.description.content.filter(b => b?.type === "image").map(b => b.src))]);
    for (const filename of filenames) await add(path.join(project.directory, filename), `assets/investments/${project.folder}/${filename}`, project.imageProvenance?.[filename]);
  }
  return result;
}

export function annotateImages(html, language, metadata) {
  return html.replace(/<img\b[^>]*>/g, tag => {
    const src = tag.match(/\bsrc="([^"]+)"/)?.[1];
    if (!src) return tag;
    const text = provenanceLabel(metadata.get(decodeURIComponent(src)), language);
    return text ? `${tag}<span class="image-provenance">${text}</span>` : tag;
  });
}
