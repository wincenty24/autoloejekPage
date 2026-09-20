# Autolejek — installation content

Each installation has its own folder under `investments/`, containing `data.json`
and its images. Keep the entire folder together when storing it in Google Drive.

```text
investments/
  test_water_filling/
    data.json
    flow-meter-and-solenoid-valve.png
    autolejek-controller.png
    pipe-water-filling.png
```

## How the website displays it

- Projects shows one image selected by `coverImage` and the `title`.
- Clicking the card opens `/{language}/project-{id}.html` with the cover,
  summary, ordered story and optional gallery.
- “Back to Projects” returns to that installation's card on the parent page.
- `description.content` is rendered in array order: text, image, text, etc.
- `gallery` adds extra images after the story. Do not repeat inline images there
  unless you want them shown twice.

`coverImage` explicitly selects the cover; JSON property order does not select it.
It defaults to `cover.png` when omitted.

## Complete data.json example

Copy `test_water_filling`, then replace its story and images. Set provenance
according to your actual images; the controller example has AI color correction.

```json
{
  "id": "my_installation",
  "title": "My installation",
  "date": "2026-09-17",
  "coverImage": "autolejek-controller.png",
  "language": "en",
  "draft": true,
  "description": {
    "short": "Describe the installation.",
    "content": [
      {
        "type": "text",
        "text": "Describe the equipment and how it is used."
      },
      {
        "type": "image",
        "src": "autolejek-controller.png",
        "width": 360,
        "caption": "Controller",
        "alt": "Controller with a display and keypad"
      }
    ]
  },
  "gallery": [],
  "imageProvenance": {
    "autolejek-controller.png": {
      "kind": "ai-edited",
      "editDetails": "color-correction"
    }
  }
}
```

## Text and image blocks

A text block needs `type: "text"` and a non-empty `text`.
An image block uses these fields:

| Field | Meaning |
| --- | --- |
| `type` | `"image"` |
| `src` | Image filename in the same folder as `data.json` |
| `alt` | Required, non-empty description for screen readers |
| `caption` | Optional visible title/caption under the picture |
| `width` | Optional maximum display width as a positive integer in CSS pixels |

For example, `"width": 360` centers the image and caption in a column up to
360 pixels wide. Use a number, not `"360px"`. The image shrinks on narrower
screens and keeps its proportions. Without `width`, it fills the story column.
This parameter controls inline story images, not the cover or separate gallery.
Clicking an inline image opens the original image.

Move the entire image block to place it after a different paragraph. Old plain
paragraph strings still work and can be mixed with blocks. All text is plain
text, not HTML.

## Adding or publishing an installation

1. Copy the `test_water_filling` folder and give the folder and `id` unique names using
   lowercase letters, digits, underscores or hyphens.
2. Replace the title, summary, paragraphs, images, captions and alt descriptions.
3. Set `date` to a valid YYYY-MM-DD date. Entries appear newest first.
4. Set `language` to the original content language (`pl` by default).
5. Adjust each inline image's `width`, or omit it for full column width.
6. Set `draft` to `true` while preparing content, or `false` to include it in the
   build. The test story is a draft; the two real installations are visible.
7. Copy the whole folder into the website repository's `content/investments/`.
8. Run `npm run check` in the repository, then use the normal deployment workflow.

Automatic Drive syncing is optional and requires configuration in GitHub Actions.
With syncing enabled, upload installation folders
to the configured Drive folder; scheduled deployments check every 15 minutes.
Without that setup, use the manual copy-and-rebuild steps above. Drive becomes
the full Projects content source when enabled; local examples are not merged.

Use PNG, JPG, WebP or AVIF images. Filenames can contain letters, digits, dots,
underscores and hyphens, without spaces or directory paths. `gallery` defaults
to an empty array. Draft entries and their images are omitted from the build.

## Translations

Add `translations.en` or `translations.pl` with its own `title` and
`description` containing `short` and the ordered `content` array.
Translate text, captions and alt descriptions; set `width` in each translated
image block too. Images may be shared or have separate translated filenames.
Translations use the same cover and date. If a translation is missing, the
original text is displayed and its language is marked in the HTML.

## Ready-to-use test story

`test_water_filling/` uses existing Autolejek images and is explicitly labeled
as test content. Both Polish and English versions show:

- Controller photo: `width: 360`.
- Flow-meter and valve illustration: `width: 680`.
- Pipe comparison: `width: 600`.

The example is not a record of a real customer installation.


## Image filenames

Use descriptive English names with lowercase letters and hyphens, for example
`12v-solenoid-valve-and-quick-coupling.png`. Keep an existing photographer name
and Pexels ID when present. Always update `coverImage`, image-block `src` values,
`gallery` and translated blocks when renaming a picture. The filename itself
does not identify whether an image was AI-generated or establish usage rights.


## Image provenance and visible labels

Use `imageProvenance` keyed by filename. It applies to covers, inline images,
galleries and both language versions. The build adds localized labels beside
AI-generated images, AI-edited photos (except color correction) and
manufacturer-document illustrations. Original images, Pexels photos and photos
with only AI color correction have no visible label. Their provenance information
is retained in the metadata and image inventory.

Supported kinds: `original`, `ai-generated`, `ai-edited`, `pexels`,
`screenshot-diagram` (used here for manufacturer-document illustrations).
For AI color correction add `"editDetails": "color-correction"`.
For other AI editing use `ai-edited` without `editDetails`.

```json
"imageProvenance": {
  "controller.png": { "kind": "ai-edited", "editDetails": "color-correction" },
  "diagram.png": { "kind": "ai-generated" },
  "installation.jpg": { "kind": "original" }
}
```

The site also recognizes previously reviewed files by their SHA-256 hash in
`content/image-provenance.json`, so identical copies receive consistent labels.
Explicit article metadata takes precedence. Reclassify a photo when replacing
or editing it; filenames alone are not evidence of image origin.
