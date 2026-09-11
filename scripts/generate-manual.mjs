import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manualRoot = path.resolve(projectRoot, "../Neptun/manuals/polish");
const manualSource = path.join(manualRoot, "manualPolish.tex");
const includeTarget = path.join(projectRoot, "src/includes/manual-polish.html");
const imageTarget = path.join(projectRoot, "public/assets/manual/images");
const imageNames = JSON.parse(await readFile(new URL("./manual-image-names.json", import.meta.url), "utf8"));
function imageName(source) {
  const original = path.basename(source);
  return imageNames[original] ?? original;
}

const { stdout } = await run("pandoc", [
  "--from=latex",
  "--to=html5",
  "--wrap=none",
  "--shift-heading-level-by=1",
  manualSource
], { cwd: manualRoot, maxBuffer: 10 * 1024 * 1024 });

const imageSources = [...stdout.matchAll(/src="([^"]+)"/g)].map(match => match[1]);
await mkdir(imageTarget, { recursive: true });
for (const source of new Set(imageSources)) {
  await copyFile(path.resolve(manualRoot, source), path.join(imageTarget, imageName(source)));
}

const html = stdout.replaceAll(/src="([^"]+)"/g, (_, source) =>
  `src="assets/manual/images/${imageName(source)}" loading="lazy"`);
const headings = [...html.matchAll(/<h2\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g)];
if (!headings.length) throw new Error("The manual does not contain any top-level chapters");

const chapters = headings.map((heading, index) => {
  const id = `manual-${heading[1]}`;
  const bodyStart = heading.index + heading[0].length;
  const bodyEnd = headings[index + 1]?.index ?? html.length;
  return { id, title: heading[2], body: html.slice(bodyStart, bodyEnd).trim() };
});

const toc = chapters.map(chapter => `<a href="#${chapter.id}" data-manual-chapter-link>${chapter.title}</a>`).join("\n");
const sections = chapters.map((chapter, index) => `<details class="manual-chapter" id="${chapter.id}"${index === 0 ? " open" : ""}>
  <summary class="manual-chapter-heading"><h2>${chapter.title}</h2><span class="accordion-icon" aria-hidden="true"></span></summary>
  <div class="manual-chapter-content">${chapter.body}</div>
</details>`).join("\n");

await mkdir(path.dirname(includeTarget), { recursive: true });
await writeFile(includeTarget, `<nav class="manual-toc" aria-label="Spis rozdziałów">
${toc}
</nav>
<div class="manual-chapters" data-manual-chapters>
${sections}
</div>
`);

console.log(`Generated ${chapters.length} manual chapters and copied ${new Set(imageSources).size} images.`);
