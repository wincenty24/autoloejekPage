import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { driveClient, syncDrive } from "./sync-drive.mjs";

const folderType = "application/vnd.google-apps.folder";
const folder = (id, name) => ({ id, name, mimeType: folderType });
const file = (id, name, mimeType = "image/png") => ({ id, name, mimeType });
const data = { id: "sample", title: "Sample", date: "2026-09-16", description: { short: "Summary", content: [{ type: "image", src: "detail.png", alt: "Detail", width: 360 }] }, coverImage: "cover.png" };
async function setup(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "autolejek-sync-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const destination = path.join(root, "synced");
  await mkdir(destination);
  await writeFile(path.join(destination, "previous.txt"), "previous content");
  const listings = { root: [folder("sample", "sample")], sample: [file("json", "data.json", "application/json"), file("cover", "cover.png"), file("detail", "detail.png")] };
  const contents = { json: JSON.stringify(data), cover: "image", detail: "image" };
  const client = { list: async id => listings[id], download: async file => Buffer.from(contents[file.id]) };
  return { root, destination, listings, contents, client };
}

test("syncs a complete snapshot including ordered image blocks and removes old content", async t => {
  const f = await setup(t);
  const result = await syncDrive({ ...f, folderId: "root" });
  assert.deepEqual(result, { installations: 1, published: 1 });
  assert.deepEqual(await readdir(f.destination), ["sample"]);
  assert.equal(await readFile(path.join(f.destination, "sample/detail.png"), "utf8"), "image");
});

test("accepts investments wrapper and skips draft images", async t => {
  const f = await setup(t);
  f.listings.wrapper = f.listings.root;
  f.listings.root = [folder("wrapper", "investments")];
  f.contents.json = JSON.stringify({ ...data, draft: true });
  delete f.contents.cover;
  delete f.contents.detail;
  const result = await syncDrive({ ...f, folderId: "root" });
  assert.equal(result.published, 0);
  assert.deepEqual(await readdir(path.join(f.destination, "sample")), ["data.json"]);
});

for (const kind of ["missing image", "invalid JSON", "duplicate folder", "unsafe folder", "download failure", "empty folder"]) {
  test(`${kind} preserves the previous snapshot`, async t => {
    const f = await setup(t);
    if (kind === "missing image") f.listings.sample = f.listings.sample.filter(file => file.name !== "detail.png");
    if (kind === "invalid JSON") f.contents.json = "not JSON";
    if (kind === "duplicate folder") f.listings.root.push(folder("sample", "sample"));
    if (kind === "unsafe folder") f.listings.root[0].name = "../escape";
    if (kind === "download failure") f.client.download = async () => { throw new Error("network failed"); };
    if (kind === "empty folder") f.listings.root = [];
    await assert.rejects(syncDrive({ ...f, folderId: "root" }));
    assert.equal(await readFile(path.join(f.destination, "previous.txt"), "utf8"), "previous content");
    assert.deepEqual(await readdir(f.root), ["synced"]);
  });
}

test("Drive listing follows pagination and sends the API key only in a header", async () => {
  const calls = [];
  const client = driveClient("test-secret", async (url, options) => {
    calls.push(url);
    assert.equal(options.headers["X-Goog-Api-Key"], "test-secret");
    assert.ok(!url.href.includes("test-secret"));
    return new Response(JSON.stringify(calls.length === 1 ? { files: [folder("a", "first")], nextPageToken: "next" } : { files: [folder("b", "second")] }));
  });
  assert.equal((await client.list("root")).length, 2);
  assert.equal(calls[1].searchParams.get("pageToken"), "next");
  assert.equal(calls[0].searchParams.get("q"), "'root' in parents and trashed = false");
});

test("Drive failures do not expose API credentials", async () => {
  const client = driveClient("test-secret", async () => new Response("test-secret", { status: 403 }));
  await assert.rejects(client.list("root"), error => error.message.includes("403") && !error.message.includes("test-secret"));
  assert.throws(() => driveClient(""), /GOOGLE_DRIVE_API_KEY/);
});

test("rejects incomplete listings and oversized downloads", async () => {
  const incomplete = driveClient("key", async () => new Response(JSON.stringify({ files: [], incompleteSearch: true })));
  await assert.rejects(incomplete.list("root"), /incomplete/);
  const download = driveClient("key", async () => new Response("too large"));
  await assert.rejects(download.download(file("img", "cover.png"), 3), /size limit/);
});
