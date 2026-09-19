/* =========================================================
   FLASHCARD MODE
   Diagram-based cards are consolidated: instead of one card
   per number/letter, each diagram becomes ONE flashcard —
   front shows the blank image with a generic prompt, back
   shows the fully labeled solution image (plus, for a couple
   of diagrams where the image alone doesn't carry the full
   answer, a short written list).
   ========================================================= */

let flashState = null;

const GROUP_FLASH_TITLES = {
  'Ábra: A sejtmembrán felépítése': 'Miket jelölnek a számok?',
  'Ábra: A sejthártya részletes felépítése': 'Miket jelölnek a betűk?',
  'Ábra: Az állati sejt részletes felépítése': 'Miket jelölnek a számok?',
  'Ábra: Sejttípusok összehasonlítása': 'Melyik sejttípust jelöli az egyes sorok száma?',
  'Ábra: A négy fő szövettípus': 'Melyik szövettípust mutatja az egyes számozott kártya, és mi a feladata?',
  'Ábra: A mitokondrium felépítése': 'Miket jelölnek a számok?',
  'Ábra: A fehérjeszintézis és -szállítás útja': 'Miket jelölnek a számok?',
  'Ábra: A sejtet felépítő anyagok': 'Melyik anyagcsoportot jelöli az egyes sorok száma?',
  'Ábra: A sejt működésének összefoglalása': 'Miket jelölnek a számozott körök?',
  'Ábra: Fogalmak és jelentésük': 'Melyik fogalom kapcsolata/jelentése szerepel az egyes sorokban?',
  'Ábra: A fehérje kiválasztásának lépései': 'Mit jelentenek az egyes számozott lépések?'
};

// Groups where the image alone doesn't carry the complete answer
// (e.g. the tissue-card image already shows the name; the function
// list is the part actually worth testing), so we also print a list.
const GROUP_FLASH_LIST_OVERRIDE = {
  'Ábra: A négy fő szövettípus': [
    '1. Hámszövet — borítás, elhatárolás, felszívás',
    '2. Kötő- és támasztószövet — összekapcsolás, kitöltés, támasztás',
    '3. Izomszövet — összehúzódás, mozgás',
    '4. Idegszövet — ingerfelvétel, ingerületvezetés, információfeldolgozás'
  ].join('\n')
};

function buildGroupFlashcard(g){
  return {
    id: 'grp:' + g.section,
    section: g.section,
    q: GROUP_FLASH_TITLES[g.section] || 'Miket jelölnek a számok?',
    a: GROUP_FLASH_LIST_OVERRIDE[g.section] || '',
    img: g.img,
    imgBack: g.imgBack,
    isGroup: true
  };
}

function buildFlashDeck(pool){
  const abraSections = new Set(pool.filter(c => c.section.startsWith('Ábra:')).map(c => c.section));
  const textCards = pool.filter(c => !c.section.startsWith('Ábra:'));
  const groupCards = MATCH_GROUPS
    .filter(g => abraSections.has(g.section))
    .map(g => buildGroupFlashcard(g));
  return [...textCards, ...groupCards];
}

function beginFlash(pool){
  const deck = buildFlashDeck(pool);
  flashState = {
    fullPool: deck,
    deck: shuffleArr(deck),
    index: 0,
    onlyLearning: false
  };
  document.getElementById('flashOnlyLearning').checked = false;
  showView('view-flash');
  renderFlash();
}

function currentFlashDeck(){
  if(flashState.onlyLearning){
    const filtered = flashState.deck.filter(c=>progress.learning[c.id]);
    return filtered.length ? filtered : flashState.deck;
  }
  return flashState.deck;
}

function renderFlash(){
  const deck = currentFlashDeck();
  if(flashState.index >= deck.length) flashState.index = 0;
  const card = deck[flashState.index];
  document.getElementById('flashcard').classList.remove('flipped');
  document.getElementById('flashTagFront').textContent = card.section;

  const flashImg = document.getElementById('flashImage');
  if(card.img){ flashImg.src = card.img; flashImg.style.display='block'; }
  else { flashImg.style.display='none'; flashImg.removeAttribute('src'); }

  const flashImgBack = document.getElementById('flashImageBack');
  if(card.imgBack){ flashImgBack.src = card.imgBack; flashImgBack.style.display='block'; }
  else { flashImgBack.style.display='none'; flashImgBack.removeAttribute('src'); }

  document.getElementById('flashFront').textContent = card.q;

  const backTextEl = document.getElementById('flashBack');
  if(card.a && card.a.trim() !== ''){
    backTextEl.style.display = 'block';
    backTextEl.innerHTML = card.a.split('\n').map(line => `<div>${line}</div>`).join('');
  } else {
    backTextEl.style.display = 'none';
    backTextEl.innerHTML = '';
  }

  document.getElementById('flashCounter').textContent = `${flashState.index+1} / ${deck.length}`;
  document.getElementById('btnLearning').classList.toggle('active', !!progress.learning[card.id]);
}

function flipFlash(){
  if(suppressNextFlip){ suppressNextFlip = false; return; }
  document.getElementById('flashcard').classList.toggle('flipped');
}
function flashNext(){
  const deck = currentFlashDeck();
  flashState.index = (flashState.index + 1) % deck.length;
  renderFlash();
}
function flashPrev(){
  const deck = currentFlashDeck();
  flashState.index = (flashState.index - 1 + deck.length) % deck.length;
  renderFlash();
}
function shuffleFlash(){
  flashState.deck = shuffleArr(flashState.deck);
  flashState.index = 0;
  renderFlash();
}
function applyFlashFilter(){
  flashState.onlyLearning = document.getElementById('flashOnlyLearning').checked;
  flashState.index = 0;
  renderFlash();
}
function toggleFlashLearning(){
  const deck = currentFlashDeck();
  const card = deck[flashState.index];
  if(progress.learning[card.id]) delete progress.learning[card.id];
  else progress.learning[card.id] = true;
  saveProgress();
  renderFlash();
}

/* ---------------------------------------------------------
   Swipe gesture: swipe left/right on the card to move to the
   next/previous card. A short tap still flips it. We detect a
   swipe by horizontal distance dominating vertical distance,
   and suppress the click-to-flip that mobile browsers fire
   right after a touch gesture ends.
   --------------------------------------------------------- */
let touchStartX = 0, touchStartY = 0, suppressNextFlip = false;

function initFlashSwipe(){
  const el = document.getElementById('flashcard');
  if(!el) return;
  el.addEventListener('touchstart', (e)=>{
    const t = e.changedTouches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  }, {passive:true});
  el.addEventListener('touchend', (e)=>{
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    const SWIPE_THRESHOLD = 40;
    if(Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5){
      suppressNextFlip = true;
      if(dx < 0) flashNext(); else flashPrev();
    }
  }, {passive:true});
}
initFlashSwipe();
