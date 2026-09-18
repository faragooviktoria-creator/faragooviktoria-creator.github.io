/* =========================================================
   DISTRACTOR GENERATION
   Picks wrong answers that are topically and stylistically
   plausible, instead of pure random noise from the whole deck.
   Shared by both Quiz mode and Exam mode.
   ========================================================= */

function lengthBucket(text){
  const len = text.length;
  if(len <= 18) return 'short';
  if(len <= 55) return 'medium';
  return 'long';
}
function isYesNo(text){
  const t = text.trim().toLowerCase();
  return t==='igen.' || t==='nem.' || t==='igen' || t==='nem';
}

function makeOptions(card, pool){
  const correctBucket = lengthBucket(card.a);
  const correctIsYesNo = isYesNo(card.a);
  const usedTexts = new Set([card.a]);
  const distractors = [];

  // Compatibility filter: keep the multiple-choice options plausible —
  // don't mix a one-word "Igen." answer in with full-sentence answers.
  const compatible = c =>
    !usedTexts.has(c.a) &&
    (isYesNo(c.a) === correctIsYesNo) &&
    (correctIsYesNo || lengthBucket(c.a) === correctBucket);

  const tryAdd = (candidates) => {
    for(const c of shuffleArr(candidates)){
      if(distractors.length >= 3) break;
      if(!compatible(c)) continue;
      usedTexts.add(c.a);
      distractors.push(c.a);
    }
  };

  // 1) Same topic/section first — most plausible near-misses.
  tryAdd(pool.filter(c => c.id!==card.id && c.section===card.section));
  // 2) For diagram-labeling cards ("Ábra: ..."), prefer OTHER diagrams'
  //    labels next — short label-style answers (organelle names, letters,
  //    table entries) read far more plausibly next to each other than
  //    next to an unrelated full-sentence flashcard answer.
  if(distractors.length < 3 && card.section.startsWith('Ábra:')){
    tryAdd(pool.filter(c => c.id!==card.id && c.section.startsWith('Ábra:') && c.section!==card.section));
  }
  // 3) Same difficulty level anywhere in the deck.
  if(distractors.length < 3){
    tryAdd(pool.filter(c => c.id!==card.id && c.difficulty===card.difficulty));
  }
  // 4) Same length bucket / yes-no shape, anywhere in the deck.
  if(distractors.length < 3){
    tryAdd(pool.filter(c => c.id!==card.id));
  }
  // 5) Last resort: anything unused at all, so we always have 4 options.
  if(distractors.length < 3){
    for(const c of shuffleArr(pool.filter(c => c.id!==card.id))){
      if(distractors.length >= 3) break;
      if(usedTexts.has(c.a)) continue;
      usedTexts.add(c.a);
      distractors.push(c.a);
    }
  }

  const options = shuffleArr([card.a, ...distractors]);
  return options;
}
