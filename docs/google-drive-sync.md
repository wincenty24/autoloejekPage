# Automatic Google Drive publishing

The deployment workflow can sync the shared Drive folder, build the site and
publish GitHub Pages every 15 minutes (at :07, :22, :37 and :52 UTC). GitHub may
delay scheduled runs; this is scheduled publishing, not an instant live feed.
The workflow must be on the default branch for scheduled runs to start.

## One-time activation

1. In [Google Cloud Console](https://console.cloud.google.com/apis/library/drive.googleapis.com),
   choose or create a project and enable **Google Drive API**.
2. In **APIs & Services → Credentials**, create an API key. Restrict its API
   access to **Google Drive API**. Browser HTTP-referrer restrictions are not
   appropriate because requests run on a GitHub Actions server.
3. Set the shared content folder and its installation files to
   **Anyone with the link → Viewer**. This implementation uses a public-folder
   API key; private folders require a different authentication setup.
4. In the website repository's [Actions secrets settings](https://github.com/wincenty24/autoloejekPage/settings/secrets/actions),
   add a repository secret named **GOOGLE_DRIVE_API_KEY** containing the key.
   Do not put the key in source files, JSON content, README files or chat.
5. In [Actions variables settings](https://github.com/wincenty24/autoloejekPage/settings/variables/actions),
   add the repository variable **GOOGLE_DRIVE_SYNC_ENABLED** with value **true**.
6. Publish these code changes to `main`. Run **Actions → Deploy GitHub Pages →
   Run workflow** for an immediate first sync, or wait for the scheduled run.

The configured folder ID is in `drive.config.json`:
`1QQrEfhVCTJHLkt_3Ca8i_uRrG19QvDb6`.
Change that file if you choose another shared folder.

## Folder layout

Upload extracted folders, not ZIP archives:

```text
shared Drive folder/
  test_water_filling/
    data.json
    cover.png
    controller.png
    pipe-water-filling.png
  another_installation/
    data.json
    cover.png
```

An `investments/` wrapper directly inside the shared folder is also supported.
When present, that wrapper is used as the content root. Avoid mixing installation
folders outside and inside it. Other nested wrapper folders and Drive shortcuts
are not traversed.

Each installation must contain `data.json`; folders without it are ignored.
Upload images first and `data.json` last. For an existing installation, upload
new image files before changing JSON references. `draft: true` hides a complete
entry; change it to `false` when ready. Read [the content guide](../content/README.md)
for ordered images, captions, widths and translations.

## What updates automatically

When enabled, Drive is the complete source of the published Projects collection.
Repository sample entries are not merged into it. Upload all installations you
want to show. Changes to descriptions, captions, widths and photos are included
on the next successful deployment. Removing an installation from Drive removes
its page on the next successful deployment.

The sync downloads into a staged directory, validates it, then replaces the
ignored `.drive-content/` snapshot. Invalid JSON, missing referenced images,
duplicate installation IDs or filenames, API errors and download failures stop
the build. GitHub Pages keeps the previously deployed site.

A folder with no installations is treated as a possible configuration mistake
and stops sync. To intentionally show an empty collection, leave an installation
folder with `draft: true`. Each image is limited to 20 MB, each JSON file to 1 MB,
and one sync to 500 MB.

The API key stays in the build environment; it is not included in browser code
or the deployed site. Only referenced images are copied into the site output.
Sync does not modify Drive or commit downloaded content to Git.

## Local commands

Normal local work remains unchanged and uses `content/investments/`:

```bash
npm run check
```

To preview Drive content, set `GOOGLE_DRIVE_API_KEY` securely in your environment,
then run:

```bash
npm run drive:sync
INVESTMENTS_DIR=.drive-content npm run check
python3 -m http.server 8080 -d _site
```

Without a configured key, `drive:sync` fails with a setup message. Scheduled
builds are skipped until `GOOGLE_DRIVE_SYNC_ENABLED` is `true`; ordinary push
and manual builds continue to use local content while disabled.

To disable syncing, change the variable to `false`. The next push or manual
build uses repository content again. GitHub can disable scheduled workflows in
inactive public repositories after 60 days; re-enable the workflow in Actions
if updates stop.

## References

- [Google: searching a public folder with an API key](https://developers.google.com/workspace/drive/api/guides/search-files)
- [Google: downloading file content](https://developers.google.com/workspace/drive/api/guides/manage-downloads)
- [GitHub: scheduled workflow behavior](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)
