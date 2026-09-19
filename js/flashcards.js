/* =========================================================
   FLASHCARD MODE
   ========================================================= */

let flashState = null;

function beginFlash(pool){
  flashState = {
    fullPool: pool,
    deck: shuffleArr(pool),
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
  document.getElementById('flashBack').textContent = card.a;
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
