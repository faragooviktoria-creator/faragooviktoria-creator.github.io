# Kártyás tanuló

Offline is használható kártyás tanuló alkalmazás. Telefonon és számítógépen is működik.

## Funkciók
- Kategóriaválasztó felület (jelenleg: Csontváz rendszer)
- Kártyák lapozása, fordítása koppintással vagy csúsztatással
- „✓ Tudom” jelölés, szűrés: Mind / Még nem tudom / Tudom
- Keverés, haladás nullázása
- Offline használat (az első megnyitás után), telefonra telepíthető

## Feltöltés GitHubra (GitHub Pages)
1. Hozz létre egy új repót, és töltsd fel ide a mappa tartalmát (a `index.html` legyen a gyökérben).
2. Repo → **Settings → Pages** → Source: `Deploy from a branch`, Branch: `main` / `(root)`.
3. Pár perc múlva a `https://<felhasznalonev>.github.io/<repo-nev>/` címen elérhető.
4. Telefonon nyisd meg a címet böngészőben, majd „Főképernyőre adás” → offline app.

## Új kategória hozzáadása
1. A `data/categories.js` fájlban vegyél fel egy új objektumot a `CATEGORIES` tömbbe:
   ```js
   { id: "uj-tema", title: "Új téma", cards: [ { id: "ut01", q: "Kérdés?", a: "Válasz." } ] }
   ```
2. Az `id` és a kártyák `id` értékei legyenek egyediak, és később ne változtasd őket (a haladás ezekhez van mentve).
3. A `sw.js` fájlban növeld a `CACHE` verziószámát (pl. `kartyak-v2`), hogy a telefonok frissüljenek.

## Megjegyzés
A „megtanult” jelölések a böngészőben tárolódnak, eszközönként külön. Ha a böngésző adatait törlöd, a haladás is törlődik.
