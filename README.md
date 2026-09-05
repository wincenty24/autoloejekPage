# Autolejek

Wielojęzyczna strona statyczna publikowana przez GitHub Pages. Gotowe pliki HTML są generowane podczas wdrożenia — przeglądarka nie pobiera słowników i nie tłumaczy strony za pomocą JavaScriptu.

## Struktura

```text
src/pages/                 szablony HTML i struktura stron
src/locales/pl/            polskie treści podzielone tematycznie
src/locales/en/            angielskie treści podzielone tematycznie
public/                    CSS, JavaScript, obrazy, CNAME i .nojekyll
scripts/build.mjs          generator stron językowych
scripts/check.mjs          kontrola linków, zasobów i metadanych
site.config.json           języki, strony i adres domeny
.github/workflows/pages.yml publikacja GitHub Pages
```

Nie edytuj katalogu `_site/`. Jest generowany automatycznie i ignorowany przez Git.

## Edycja treści

Długie teksty znajdują się w plikach JSON podzielonych według języka i tematu, na przykład:

```text
src/locales/pl/meters.json
src/locales/en/meters.json
src/locales/pl/valves.json
src/locales/en/valves.json
```

Szablony w `src/pages/` określają układ strony. Atrybut `data-i18n="nazwaKlucza"` wskazuje tekst pobierany ze słownika. Wszystkie języki muszą zawierać identyczny zestaw kluczy; generator sprawdza to automatycznie.

## Budowanie lokalne

Wymagany jest Node.js 18 lub nowszy.

```bash
npm ci
npm run check
python3 -m http.server 8080 -d _site
```

Strona będzie dostępna pod `http://localhost:8080/`.

## Dodawanie języka

1. Skopiuj jeden z katalogów w `src/locales/`, np. `pl` do `de`.
2. Przetłumacz wartości, nie zmieniając nazw kluczy.
3. Dodaj kod języka do tablicy `languages` w `site.config.json`.
4. Uruchom `npm run check`.

Generator utworzy osobny zestaw stron, np. `/de/`, doda język do przełącznika oraz wygeneruje metadane `hreflang` i mapę witryny.

## GitHub Pages

Push do gałęzi `main` uruchamia workflow `.github/workflows/pages.yml`. Workflow buduje katalog `_site`, sprawdza stronę i publikuje artefakt przez oficjalne GitHub Pages Actions.

W ustawieniach repozytorium wybierz jednorazowo:

```text
Settings → Pages → Build and deployment → Source: GitHub Actions
```

Domena niestandardowa jest zachowana w `public/CNAME` i trafia do każdego artefaktu wdrożeniowego.
