import test from "node:test";
import assert from "node:assert/strict";
import { annotateImages, provenanceLabel, validateProvenance } from "./image-provenance.mjs";

test("AI color correction differs from generated content in both languages", () => {
  assert.equal(provenanceLabel({kind:"ai-edited",editDetails:"color-correction"},"pl"), "");
  assert.equal(provenanceLabel({kind:"ai-edited",editDetails:"color-correction"},"en"), "");
  assert.match(provenanceLabel({kind:"ai-generated"},"pl"), /wygenerowana/);
  assert.equal(provenanceLabel({kind:"original"},"en"), "");
});

test("labels appear beside images without changing links, captions or accessible descriptions", () => {
  const html='<figure><a href="assets/photo.png"><img src="assets/photo.png" alt="A controller"></a><figcaption>Installation</figcaption></figure><img src="assets/original.png" alt="Original">';
  const output=annotateImages(html,"en",new Map([["assets/photo.png",{kind:"ai-edited"}],["assets/original.png",{kind:"original"}]]));
  assert.equal((output.match(/class="image-provenance"/g)||[]).length,1);
  assert.match(output, /alt="A controller"><span class="image-provenance">/);
  assert.ok(output.includes('<figcaption>Installation</figcaption>'));
  assert.ok(output.endsWith('<img src="assets/original.png" alt="Original">'));
});

test("source labels and invalid provenance are handled explicitly", () => {
  assert.equal(provenanceLabel({kind:"pexels"},"en"), "");
  assert.equal(provenanceLabel({kind:"pexels"},"pl"), "");
  assert.match(provenanceLabel({kind:"screenshot-diagram"},"pl"), /dokumentacji producenta/);
  assert.throws(()=>validateProvenance({kind:'<script>'}),/Invalid/);
  assert.throws(()=>validateProvenance({kind:'ai-edited',editDetails:'unknown'}),/Unsupported/);
});
