/* =========================================================
   DATA
   Loads the question/flashcard deck from data/cards.json and
   manages the learner's saved progress in localStorage.
   ========================================================= */

let CARDS = [];

async function loadCards(){
  const res = await fetch('data/cards.json');
  if(!res.ok) throw new Error('Nem sikerult betolteni a kartyakat (data/cards.json).');
  CARDS = await res.json();
}

const LS_KEY = 'sejtbio_progress_v1';

function loadProgress(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return { learning:{} };
}
function saveProgress(){
  try{ localStorage.setItem(LS_KEY, JSON.stringify(progress)); }catch(e){}
}
let progress = loadProgress();
