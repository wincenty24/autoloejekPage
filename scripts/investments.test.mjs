import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm, readdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { loadInvestments, renderInvestments, renderInvestment, copyInvestmentImages } from "./investments.mjs";

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "autolejek-investments-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const content = path.join(root, "content");
  await mkdir(content);
  async function add(folder, overrides = {}) {
    const directory = path.join(content, folder);
    await mkdir(directory);
    const data = { id: folder, title: "Installation <one>", date: "2026-09-16", description: { short: "A & B", content: ["<script>alert(1)</script>"] }, ...overrides };
    await writeFile(path.join(directory, "data.json"), JSON.stringify(data));
    await writeFile(path.join(directory, "cover.png"), "image fixture");
    return directory;
  }
  return { root, content, add };
}

test("drafts stay unpublished; published entries sort by date and copy only referenced images", async t => {
  const f = await fixture(t);
  await f.add("draft", { draft: true });
  const directory = await f.add("older", { date: "2025-01-01", gallery: ["detail.png"] });
  await writeFile(path.join(directory, "detail.png"), "gallery fixture");
  await writeFile(path.join(directory, "private.txt"), "not published");
  await f.add("newer");
  const projects = await loadInvestments(f.content);
  assert.deepEqual(projects.map(p => p.id), ["newer", "older"]);
  const output = path.join(f.root, "output");
  await copyInvestmentImages(projects, output);
  assert.deepEqual((await readdir(path.join(output, "assets/investments"))).sort(), ["newer", "older"]);
  assert.deepEqual((await readdir(path.join(output, "assets/investments/older"))).sort(), ["cover.png", "detail.png"]);
  assert.equal(await readFile(path.join(output, "assets/investments/older/detail.png"), "utf8"), "gallery fixture");
  const html = renderInvestment(projects[1], "en");
  assert.match(html, /&lt;script&gt;/);
  assert.ok(!html.includes("<script>"));
  assert.match(html, /assets\/investments\/older\/detail.png/);
  assert.match(html, /lang="pl"/);
});

test("translations and empty state render in the requested language", async t => {
  const f = await fixture(t);
  await f.add("translated", { translations: { en: { title: "English title", description: { short: "English summary", content: ["English story"] } } } });
  const projects = await loadInvestments(f.content);
  assert.match(renderInvestments(projects, "en"), /English title/);
  assert.match(renderInvestments(projects, "pl"), /Installation &lt;one&gt;/);
  assert.match(renderInvestments([], "pl"), /Wkrótce/);
  assert.match(renderInvestments([], "en"), /Coming soon/);
});

for (const [name, overrides, pattern] of [
  ["path traversal", { coverImage: "../outside.png" }, /local PNG/],
  ["missing image", { gallery: ["missing.png"] }, /ENOENT/],
  ["invalid date", { date: "2026-02-30" }, /valid YYYY-MM-DD/],
  ["invalid description", { description: { short: "Summary", content: "not an array" } }, /description.content/],
  ["ambiguous draft", { draft: "false" }, /boolean/]
]) test(`rejects ${name}`, async t => {
  const f = await fixture(t);
  await f.add("invalid", overrides);
  await assert.rejects(loadInvestments(f.content), pattern);
});

test("duplicate IDs are rejected", async t => {
  const f = await fixture(t);
  await f.add("first");
  await f.add("second", { id: "first" });
  await assert.rejects(loadInvestments(f.content), /duplicate id/);
});


test("cards link photo and title to details; details link back to the parent card", async t => {
  const f = await fixture(t);
  await f.add("sample");
  const projects = await loadInvestments(f.content);
  const listing = renderInvestments(projects, "en");
  assert.match(listing, /href="project-sample.html"/);
  assert.equal((listing.match(/<img /g) ?? []).length, 1);
  assert.ok(!listing.includes("<details") && !listing.includes("A &amp; B"));
  assert.ok(!listing.includes("<time") && !listing.includes("&lt;script&gt;"));
  const detail = renderInvestment(projects[0], "en");
  assert.match(detail, /href="projects.html#sample"/);
  assert.match(detail, /Back to Projects/);
  assert.match(detail, /A &amp; B/);
  assert.match(detail, /&lt;script&gt;/);
  assert.match(renderInvestment(projects[0], "pl"), /Wróć do projektów/);
});

test("ordered content preserves text/image order, captions and translated image assets", async t => {
  const f = await fixture(t);
  const directory = await f.add("blocks", {
    description: { short: "Story", content: [
      "Legacy paragraph",
      { type: "text", text: "Before image" },
      { type: "image", src: "inline.png", caption: '<b>Visible caption</b>', alt: 'Controller "screen"' },
      { type: "text", text: "After image" }
    ] },
    translations: { en: { title: "English", description: { short: "Translated", content: [
      { type: "image", src: "english.png", alt: "Translated illustration" }
    ] } } }
  });
  await writeFile(path.join(directory, "inline.png"), "inline image fixture");
  await writeFile(path.join(directory, "english.png"), "translated image fixture");
  const projects = await loadInvestments(f.content);
  const html = renderInvestment(projects[0], "pl");
  assert.ok(html.indexOf("Legacy paragraph") < html.indexOf("Before image"));
  assert.ok(html.indexOf("Before image") < html.indexOf("<figure"));
  assert.ok(html.indexOf("</figure>") < html.indexOf("After image"));
  assert.match(html, /<figcaption>&lt;b&gt;Visible caption&lt;\/b&gt;<\/figcaption>/);
  assert.match(html, /alt="Controller &quot;screen&quot;"/);
  assert.ok(!renderInvestment(projects[0], "en").includes("<figcaption>"));
  const output = path.join(f.root, "output");
  await copyInvestmentImages(projects, output);
  assert.deepEqual((await readdir(path.join(output, "assets/investments/blocks"))).sort(), ["cover.png", "english.png", "inline.png"]);
  assert.equal((renderInvestments(projects, "pl").match(/<img /g) ?? []).length, 1);
});

for (const [name, block, pattern] of [
  ["unknown block type", { type: "html", text: "content" }, /content blocks/],
  ["missing alt text", { type: "image", src: "cover.png" }, /content blocks/],
  ["unsafe inline image", { type: "image", src: "../cover.png", alt: "image" }, /local PNG/],
  ["missing inline image", { type: "image", src: "absent.png", alt: "image" }, /ENOENT/]
]) test(`rejects ${name}`, async t => {
  const f = await fixture(t);
  await f.add("invalid_block", { description: { short: "Story", content: [block] } });
  await assert.rejects(loadInvestments(f.content), pattern);
});

test("optional image width limits the figure and preserves default sizing", async t => {
  const f = await fixture(t);
  await f.add("sized", { description: { short: "Story", content: [
    { type: "image", src: "cover.png", alt: "Small picture", width: 360 },
    { type: "image", src: "cover.png", alt: "Default picture" }
  ] } });
  const [project] = await loadInvestments(f.content);
  const html = renderInvestment(project, "pl");
  assert.match(html, /class="project-inline-image" style="max-width:360px"/);
  assert.match(html, /class="project-inline-image"><a/);
});

test("invalid widths are rejected, including in translations", async t => {
  const f = await fixture(t);
  for (const [index, width] of [0, -20, 1.5, "360", "360px", null, true].entries()) {
    const content = path.join(f.root, `invalid-width-${index}`);
    await mkdir(content);
    await writeFile(path.join(content, "data.json"), JSON.stringify({
      id: `invalid-${index}`, title: "Test", date: "2026-09-16", description: { short: "Summary", content: [] },
      translations: { en: { title: "English", description: { short: "Summary", content: [
        { type: "image", src: "cover.png", alt: "Picture", width }
      ] } } }
    }));
    // Each isolated root contains only its installation folder.
    const isolated = path.join(f.root, `root-${index}`);
    await mkdir(isolated);
    const { rename } = await import('node:fs/promises');
    await rename(content, path.join(isolated, `invalid-${index}`));
    await assert.rejects(loadInvestments(isolated), /width must be a positive integer/);
  }
});
