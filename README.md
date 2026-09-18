# Sejtbiológia — Tanulókártyák

Offline-first study app (quiz / flashcard / exam modes) for a cell biology course,
built as a plain static site: no build step, no framework, no dependencies.

## Folder structure

```
index.html          the app shell (markup only)
css/
  styles.css        all styling
js/
  utils.js          generic helpers (shuffle)
  data.js           loads data/cards.json, saves progress to localStorage
  topics.js         topic filter state + UI
  navigation.js     view switching, mode selector entry point
  quiz-engine.js    shared multiple-choice distractor logic (quiz + exam)
  quiz.js           Quiz mode
  flashcards.js     Flashcard mode
  exam.js           Exam mode
  app.js            boots the app (loads data, then wires up the UI)
data/
  cards.json        452 question/answer/flashcard entries (deduplicated,
                     course-logistics/meta questions removed)
images/
  cell-diagram-*.jpg    19 diagrams from the original PDF content
  diagram-*.jpg         11 labeling diagrams (organelle/structure identification),
                        each backing several "what does number/letter N mean?" cards
```

Load order in `index.html` matters, since these are plain scripts (no bundler):
`utils → data → topics → navigation → quiz-engine → quiz → flashcards → exam → app`.
Each file relies on globals defined by the ones before it.

## Running locally

Because `data/cards.json` is loaded with `fetch()`, the app must be served over
`http://`, not opened directly as a `file://` path — browsers block `fetch()`
against local files for security reasons. Any of these work:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

or the VS Code "Live Server" extension, or any static file server.

## Deploying on GitHub Pages

1. Push this folder's contents to a GitHub repo (root, or a `/docs` folder).
2. Repo → Settings → Pages → set the source branch/folder.
3. GitHub Pages serves everything over https, so `fetch()` works with no changes needed.

## Editing content

- To fix a question/answer or add new ones, edit `data/cards.json` directly —
  it's plain JSON, one object per card: `{ "section", "q", "a", "difficulty", "id", "img"? }`.
- `img` is optional and is a relative path into `images/`.
- No rebuild step: just refresh the page.

## Diagram-labeling questions

11 of the source diagrams (membrane structure, the full cell with 14 parts,
the mitochondrion, the protein-secretion pathway, tissue types, cell types,
etc.) were split into individual "what does number/letter N point to?"
questions — one card per label, all sharing the same image. These live in
sections named `Ábra: ...` in `data/cards.json`. The multiple-choice
distractor logic (`js/quiz-engine.js`) prefers pulling wrong answers from
other labels on the *same* diagram first, then from other diagrams, so the
options stay visually/contextually plausible instead of mixing in unrelated
sentence-style flashcard answers.
