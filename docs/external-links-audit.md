# External website link audit — 2026-09-17

Scope: all distinct HTTP(S) links in website source HTML, including shared
includes. First-party canonical URLs, mailto links and developer documentation
are excluded. Repeated footer links are counted once.

Result: 13 distinct external links returned HTTP 200. All 7 PDF URLs returned
PDF content (verified by the `%PDF` signature), not HTML error pages.
This checks availability and source type; it does not certify licensing,
technical accuracy, ownership, or whether every document is the newest version.
YouTube and Drive can return HTTP 200 for consent/login/application shells.

| Link | Source file | Result | Assessment |
| --- | --- | --- | --- |
| [GSD8-R product sheet](https://bmeters.pl/wp-content/uploads/2025/05/GSD8-R_karta_produktowa_A4_13_07_2026.pdf) | src/pages/build-it-yourself.html | HTTP 200; PDF confirmed | BMETERS Poland source; keep external link. |
| [Positive-displacement meter article](https://en.wikipedia.org/wiki/Positive_displacement_meter) | src/pages/build-it-yourself.html | HTTP 200 | Secondary reference, not manufacturer documentation. |
| [GSD8-R product page](https://bmeters.pl/produkt/gsd8-r/) | src/pages/build-it-yourself.html | HTTP 200 | BMETERS Poland product page. |
| [Multilingual water-meter installation guide](https://www.bmeters.com/wp-content/uploads/2023/07/MAN025_quick-user-guide-12-lingue.pdf) | src/pages/build-it-yourself.html | HTTP 200; PDF confirmed | BMETERS manufacturer PDF. |
| [Water-meter error curves](https://bmeters.pl/wp-content/uploads/2026/08/Krzywe_bledow_wodomierzy_06_08_2026.pdf) | src/pages/build-it-yourself.html | HTTP 200; PDF confirmed | BMETERS Poland PDF. |
| [YF-G1 datasheet](https://www.plexishop.it/pdf/Misuratore_di_flusso_per_liquidi_YF-G1_DN25.pdf) | src/pages/build-it-yourself.html | HTTP 200; PDF confirmed | Retailer-hosted PDF; hosting/redistribution authorization not established by availability. |
| [Water-meter installation guide, page 2](https://www.bmeters.com/wp-content/uploads/2021/05/Quick-User-Guide_Water-Meters_ver2.0.pdf#page=2) | src/pages/build-it-yourself.html | HTTP 200; PDF confirmed | BMETERS manufacturer PDF; older version. Review relevance separately from link health. |
| [MAG-C manual, page 24](https://www.bmeters.com/wp-content/uploads/2021/06/MAG-C_v2.0_ENG.pdf#page=24) | src/pages/build-it-yourself.html | HTTP 200; PDF confirmed | BMETERS manufacturer PDF; MAG-C is a different meter family. Keep the existing context-specific caveat. |
| [Autolejek YouTube channel](https://www.youtube.com/@autolejek) | src/pages/about-project.html, src/pages/build-it-yourself.html, src/pages/configure-yourself.html, src/pages/contact.html, src/pages/index.html, src/pages/manual.html, src/pages/projects.html | HTTP 200 | HTTP 200 with YouTube redirect parameters; not a verification of channel ownership or video availability. |
| [2N solenoid-valve manual](https://hpcontrol.pl/katalog/ONLINE-HPCONTROL/Elektrozawory/Manual_2N.pdf) | src/pages/configure-yourself.html | HTTP 200; PDF confirmed | Supplier-hosted PDF. |
| [CMW115 level sensor](https://botland.com.pl/czujniki-poziomu-cieczy/15233-magnetyczny-czujnik-poziomu-cieczy-cmw115-5903351249638.html) | src/pages/configure-yourself.html | HTTP 200 | Retailer product page. |
| [DFRobot level sensor](https://www.dfrobot.com/product-1493.html#.V6MNRjWn_OA) | src/pages/configure-yourself.html | HTTP 200 | Product-vendor page. Legacy URL fragment can be removed as cleanup. |
| [Autolejek Drive collection](https://drive.google.com/drive/folders/1QQrEfhVCTJHLkt_3Ca8i_uRrG19QvDb6) | src/pages/projects.html | HTTP 200 | HTTP 200 for the folder page does not prove anonymous access to all contained files. Remove visitor-facing link if folder is made private. |

## Local BMETERS manual: exact-source search

The link in `src/pages/configure-yourself.html` currently points to the local
`public/assets/buildityourself/IMPULSE-DEVICES-instructions-ENG.pdf`.
Its title is *Water meters with reed pulse contact*; it covers reed-output meters.

An exact, byte-for-byte copy was found here:

[Allvalve-hosted BMETERS manual](https://www.allvalve.com.au/wp-content/uploads/2023/07/IMPULSE-DEVICES-instructions-ENG.pdf)

SHA-256 of both downloaded and local copies:
`3a6dca83a0cb195143b374eb0625977da35e8d3a2142d5e859cb482a99cd6f1a`

**This is not a BMETERS-owned URL.** Its presence on a supplier website does not
by itself establish that supplier's redistribution permission.

No exact copy was located on the current BMETERS international or Polish sites.
Checked their download listings, relevant product pages, public international
WordPress media search and search-engine results. Several plausible historical
paths returned 404; do not use guessed URLs.

- [BMETERS international downloads](https://www.bmeters.com/en/download/)
- [BMETERS Poland files](https://bmeters.pl/plik/)
- [BMETERS Poland GSD8-R page](https://bmeters.pl/produkt/gsd8-r/)

The official [IWM-PL3 product page](https://www.bmeters.com/en/products/iwm-pl3/)
links to a [PL3/PL4 connection guide](https://www.bmeters.com/wp-content/uploads/2023/07/PL3-PL4-Output-Connection_v1.3.pdf).
That guide concerns electronic open-drain outputs, not the reed-contact manual.
It is not a like-for-like replacement and should not be substituted silently.

## Recommended next changes

1. For the local reed-contact PDF, obtain a current official URL or explicit
   redistribution permission from BMETERS. Their official GSD8-R product page is
   an available general reference, but is not the same document.
2. Keep existing BMETERS direct document links; they currently resolve to PDFs.
3. Review the retailer-hosted YF-G1 document's provenance separately if a
   manufacturer-only source policy is desired.
4. Remove the visitor-facing Drive link if content storage becomes private.
5. Optionally remove DFRobot's obsolete `#.V6MNRjWn_OA` fragment.

No website links or PDFs were changed as part of this audit.

## Follow-up implemented

The user subsequently approved the exact-copy Allvalve link. The configuration
page now links there and identifies Allvalve as the host in both languages.
The previous local PDF was moved out of the public assets into a Downloads backup.
The 13-link table above records the pre-change audit.
