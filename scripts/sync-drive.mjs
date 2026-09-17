import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadInvestments } from "./investments.mjs";

const folderType = "application/vnd.google-apps.folder";
const safeId = /^[a-zA-Z0-9_-]+$/;
const safeFolder = /^[a-z0-9][a-z0-9_-]*$/;
const safeImage = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*\.(png|jpe?g|webp|avif)$/i;

export function driveClient(apiKey, fetchImpl = fetch) {
  if (!apiKey) throw new Error("Set GOOGLE_DRIVE_API_KEY before syncing Google Drive.");
  async function request(id, parameters = {}) {
    if (id && !safeId.test(id)) throw new Error("Invalid Google Drive file ID.");
    const url = new URL(`https://www.googleapis.com/drive/v3/files${id ? `/${id}` : ""}`);
    url.search = new URLSearchParams(parameters).toString();
    for (let attempt = 0; attempt < 3; attempt++) {
      let response;
      try {
        response = await fetchImpl(url, { headers: { "X-Goog-Api-Key": apiKey }, signal: AbortSignal.timeout(30000) });
      } catch {
        throw new Error("Google Drive request failed or timed out. Check network access and retry.");
      }
      if (response.ok) return response;
      await response.body?.cancel();
      if ((response.status === 429 || response.status >= 500) && attempt < 2) {
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
        continue;
      }
      throw new Error(`Google Drive returned HTTP ${response.status}. Check the API key, Drive API enablement and public viewer access to the folder and files.`);
    }
  }
  return {
    async list(parentId) {
      if (!safeId.test(parentId)) throw new Error("Invalid Google Drive folder ID.");
      const files = [];
      const tokens = new Set();
      let pageToken;
      do {
        const response = await request("", { q: `'${parentId}' in parents and trashed = false`, fields: "nextPageToken,incompleteSearch,files(id,name,mimeType,size)", pageSize: "1000", ...(pageToken ? { pageToken } : {}) });
        const page = await response.json();
        if (!Array.isArray(page.files) || page.incompleteSearch) throw new Error("Google Drive returned an incomplete listing; sync stopped.");
        files.push(...page.files);
        if (files.length > 10000) throw new Error("Google Drive folder exceeds the 10000-file sync limit.");
        pageToken = page.nextPageToken;
        if (pageToken && tokens.has(pageToken)) throw new Error("Google Drive repeated a pagination token.");
        tokens.add(pageToken);
      } while (pageToken);
      return files;
    },
    async download(file, maxBytes) {
      if (Number(file.size) > maxBytes) throw new Error(`File exceeds download size limit: ${file.name}`);
      const response = await request(file.id, { alt: "media" });
      const chunks = [];
      let size = 0;
      for await (const chunk of response.body) {
        size += chunk.length;
        if (size > maxBytes) throw new Error(`File exceeds download size limit: ${file.name}`);
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    }
  };
}

export async function syncDrive({ client, folderId, destination }) {
  if (!safeId.test(folderId)) throw new Error("Invalid Google Drive folder ID.");
  let entries = await client.list(folderId);
  const wrappers = entries.filter(entry => entry.name === "investments" && entry.mimeType === folderType);
  if (wrappers.length > 1) throw new Error("Duplicate investments folders in Google Drive.");
  if (wrappers.length) entries = await client.list(wrappers[0].id);
  await mkdir(path.dirname(destination), { recursive: true });
  const staging = await mkdtemp(path.join(path.dirname(destination), ".drive-staging-"));
  const backup = `${staging}-previous`;
  let backedUp = false;
  let installed = false;
  let bytes = 0;
  const names = new Set();
  try {
    for (const folder of entries.filter(entry => entry.mimeType === folderType)) {
      const files = await client.list(folder.id);
      const dataFiles = files.filter(file => file.name === "data.json");
      if (!dataFiles.length) continue;
      if (dataFiles.length !== 1) throw new Error(`Duplicate data.json in ${folder.name}`);
      if (!safeFolder.test(folder.name) || names.has(folder.name)) throw new Error(`Invalid or duplicate installation folder: ${folder.name}`);
      names.add(folder.name);
      const dataBuffer = await client.download(dataFiles[0], 1024 * 1024);
      const data = JSON.parse(dataBuffer.toString("utf8"));
      if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error(`Invalid data.json in ${folder.name}`);
      const directory = path.join(staging, folder.name);
      await mkdir(directory);
      await writeFile(path.join(directory, "data.json"), dataBuffer);
      bytes += dataBuffer.length;
      if (data.draft === true) continue;
      const images = new Set();
      for (const file of files.filter(file => safeImage.test(file.name))) {
        if (images.has(file.name)) throw new Error(`Duplicate image ${file.name} in ${folder.name}`);
        images.add(file.name);
        if (!file.mimeType.startsWith("image/")) throw new Error(`Expected an image file: ${file.name}`);
        const content = await client.download(file, 20 * 1024 * 1024);
        bytes += content.length;
        if (bytes > 500 * 1024 * 1024) throw new Error("Drive content exceeds the 500 MB sync limit.");
        await writeFile(path.join(directory, file.name), content);
      }
    }
    if (!names.size) throw new Error("No installation folders with data.json found. Sync stopped to avoid publishing an accidentally empty collection.");
    const projects = await loadInvestments(staging);
    try {
      await rename(destination, backup);
      backedUp = true;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    await rename(staging, destination);
    installed = true;
    return { installations: names.size, published: projects.length };
  } finally {
    if (backedUp && !installed) await rename(backup, destination);
    await rm(staging, { recursive: true, force: true });
    if (installed) await rm(backup, { recursive: true, force: true });
  }
}

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const config = JSON.parse(await readFile(path.join(projectRoot, "drive.config.json"), "utf8"));
    const result = await syncDrive({ client: driveClient(process.env.GOOGLE_DRIVE_API_KEY), folderId: config.folderId, destination: path.join(projectRoot, ".drive-content") });
    console.log(`Synced ${result.installations} installation folders from Drive (${result.published} published).`);
  } catch (error) {
    console.error(`Drive sync failed: ${error.message}`);
    process.exitCode = 1;
  }
}
