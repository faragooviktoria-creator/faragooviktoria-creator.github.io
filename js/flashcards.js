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
    const filtered = flashState.deck.filter(c=>progress.learning[c.id] && !progress.known[c.id]);
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
  document.getElementById('flashFront').textContent = card.q;
  document.getElementById('flashBack').textContent = card.a;
  document.getElementById('flashCounter').textContent = `${flashState.index+1} / ${deck.length}`;

  document.getElementById('btnLearning').classList.toggle('active', !!progress.learning[card.id]);
  document.getElementById('btnKnown').classList.toggle('active', !!progress.known[card.id]);
}

function flipFlash(){
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
function markFlash(kind){
  const deck = currentFlashDeck();
  const card = deck[flashState.index];
  if(kind==='known'){
    progress.known[card.id] = true;
    delete progress.learning[card.id];
  } else {
    progress.learning[card.id] = true;
    delete progress.known[card.id];
  }
  saveProgress();
  renderFlash();
}
