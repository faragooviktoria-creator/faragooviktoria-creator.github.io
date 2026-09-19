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
  matching.js       diagram drag-and-drop matching puzzles (Quiz mode only)
  quiz.js           Quiz mode — mixes MCQ questions and matching puzzles
  flashcards.js     Flashcard mode
  exam.js           Exam mode (diagram cards stay as individual MCQ items here)
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
`utils → data → topics → navigation → quiz-engine → matching → quiz → flashcards → exam → app`.
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
  it's plain JSON, one object per card: `{ "section", "q", "a", "difficulty", "id", "img"?, "imgBack"?, "label"? }`.
- `img` is the blank/numbered diagram (shown on the flashcard front and in quiz/exam).
  `imgBack` is the fully labeled solution diagram (shown on the flashcard back only).
  `label` is the specific number/letter that card refers to on the diagram — only
  present on `Ábra: ...` cards, and required by the Quiz-mode matching puzzles.
- No rebuild step: just refresh the page.

## Diagram-labeling questions

11 of the source diagrams (membrane structure, the full cell with 14 parts,
the mitochondrion, the protein-secretion pathway, tissue types, cell types,
etc.) were split into individual per-label cards — one per number/letter,
all sharing the same diagram. These live in sections named `Ábra: ...` in
`data/cards.json`.

**Flashcard mode** shows the blank numbered diagram (`img`) on the front and
the fully labeled solution diagram (`imgBack`) — plus the plain-text answer —
on the back, both displayed at 600px wide (scaling down on narrow screens).
Because these images can be taller than the card's fixed height, that
specific card scrolls internally rather than clipping the image; plain
text-only cards are unaffected and stay a fixed, scroll-free height.

**Quiz mode** turns each diagram into ONE drag-and-drop matching puzzle
instead of separate multiple-choice questions: the full image is shown
alongside a shuffled bank of all its answers, and the person drags (or taps)
each answer onto the matching numbered/lettered slot, then hits "Ellenőrzés"
to check. Scoring is proportional — 3 correct out of 4 slots earns 0.75 of a
point toward the quiz score. This logic lives in `js/matching.js` and is
wired into the normal quiz flow (`js/quiz.js`) as just another question type
mixed in with ordinary MCQ questions when the 10 questions are randomly
picked.

**Exam mode** intentionally keeps treating each diagram label as its own
individual multiple-choice question (unchanged) — the matching-puzzle UI is
Quiz-mode only, to keep the timed exam's per-question flow and navigation
grid simple.

The multiple-choice distractor logic (`js/quiz-engine.js`) prefers pulling
wrong answers from other labels on the *same* diagram first, then from other
diagrams, so the options stay visually/contextually plausible instead of
mixing in unrelated sentence-style flashcard answers.
