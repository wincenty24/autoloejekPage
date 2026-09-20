# Testowy wpis Autolejek / Autolejek test installation

Materiał wyłącznie do testów — nie jest opisem rzeczywistej realizacji.
Zdjęcie sterownika i ilustracje skopiowano z istniejących zasobów strony.

## Pliki

- data.json — tytuł, okładka oraz uporządkowany opis w PL i EN.
- flow-meter-and-solenoid-valve.png — okładka karty i ilustracja przepływomierza z zaworem.
- autolejek-controller.png — zdjęcie sterownika.
- pipe-water-filling.png — porównanie wypełnienia rury wodą.

## Jak edytować

`coverImage` wybiera zdjęcie na karcie. `title` to tytuł karty.
W `description.content` elementy wyświetlają się od góry do dołu:

```json
[
  { "type": "text", "text": "Opis przed zdjęciem." },
  { "type": "image", "src": "autolejek-controller.png", "width": 360, "caption": "Tytuł zdjęcia", "alt": "Opis zawartości zdjęcia" },
  { "type": "text", "text": "Opis po zdjęciu." }
]
```

Przenieś cały obiekt zdjęcia, aby umieścić je po innym akapicie.
`caption` jest widocznym podpisem, a `alt` opisem dla czytników ekranu.
Wersję angielską edytuj w `translations.en.description.content`.
Wszystkie zdjęcia muszą być w tym samym folderze co `data.json`.

## Dysk Google i strona

Prześlij cały folder `test_water_filling` na Dysk Google.
Po aktywacji synchronizacji GitHub Actions sprawdza folder co 15 minut.
Bez aktywnej synchronizacji, aby wyświetlić wpis, skopiuj cały folder do `content/investments/` repozytorium
strony i uruchom `npm run check`. Kopia jest już dodana do repozytorium.
Podstrona: `/pl/project-test_water_filling.html` (lub `/en/`).
`draft: true` ukrywa wpis. `draft: false` pokazuje go podczas budowania.

## English

This folder is a self-contained test entry with a controller photo and two
existing illustrations. Upload the whole folder to Google Drive for storage.
To use it on the website, copy it into `content/investments/` and rebuild using
`npm run check`. Optional automatic Drive syncing checks every 15 minutes after one-time
configuration in GitHub Actions.
The order of text/image blocks in `description.content` controls the page layout.
`caption` is the visible image title; `alt` describes the image for screen readers.


## Rozmiar zdjęcia / Image size

Dodaj `"width": 360` do obiektu zdjęcia, aby ograniczyć jego szerokość do 360 px.
Zdjęcie i podpis są wyśrodkowane. Na telefonie zdjęcie zmniejsza się, zachowując
proporcje. Brak `width` oznacza pełną szerokość kolumny tekstu.
Wartość musi być dodatnią liczbą całkowitą, bez jednostki `px`.
W przykładzie sterownik ma 360 px, układ 680 px, a porównanie rur 600 px.
Parametr ustaw również w odpowiednim bloku wersji angielskiej.

Add `"width": 360` to an image block to cap its display width at 360 CSS pixels.
Images remain centered and shrink on smaller screens without distortion.
Omit this optional parameter for full story-column width.


Pochodzenie obrazów zapisano w `imageProvenance` w pliku `data.json`.
Strona wyświetla odpowiednie oznaczenia AI/Pexels przy obrazach.
Po podmianie zdjęcia sprawdź i zaktualizuj jego klasyfikację.
