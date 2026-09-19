/* =========================================================
   DIAGRAM MATCHING PUZZLES
   Groups every "Ábra: ..." card by its diagram (section) into
   one drag-and-drop matching exercise: the numbered/lettered
   image plus a shuffled bank of answers to place onto it.
   ========================================================= */

let MATCH_GROUPS = [];

function initMatchGroups(){
  const bySection = {};
  CARDS.filter(c => c.section.startsWith('Ábra:')).forEach(c => {
    if(!bySection[c.section]){
      bySection[c.section] = { section: c.section, img: c.img, imgBack: c.imgBack, items: [] };
    }
    bySection[c.section].items.push({ id: c.id, label: c.label, answer: c.a });
  });
  MATCH_GROUPS = Object.values(bySection).map(g => {
    g.items.sort((a,b) => {
      const na = parseInt(a.label,10), nb = parseInt(b.label,10);
      const aNum = !isNaN(na), bNum = !isNaN(nb);
      if(aNum && bNum) return na - nb;
      return String(a.label).localeCompare(String(b.label));
    });
    return g;
  });
}

let matchState = null;

function renderMatchUnit(group){
  document.getElementById('quizMcqBlock').style.display = 'none';
  document.getElementById('quizMatchBlock').style.display = 'block';
  document.getElementById('quizTag').textContent = group.section;
  document.getElementById('matchImage').src = group.img;

  const shuffledAnswers = shuffleArr(group.items.map((it, idx) => ({ idx, text: it.answer, used:false })));
  matchState = {
    group,
    slots: group.items.map(it => ({ label: it.label, answer: it.answer, filled: null })),
    bank: shuffledAnswers,
    selected: null,
    checked: false
  };
  document.getElementById('matchFeedback').classList.remove('show');
  document.getElementById('matchFeedback').innerHTML = '';
  renderMatchUI();
  document.getElementById('quizNextBtn').disabled = true;
}

function renderMatchUI(){
  const slotsWrap = document.getElementById('matchSlots');
  slotsWrap.innerHTML = '';
  matchState.slots.forEach((slot, i) => {
    const div = document.createElement('div');
    let cls = 'match-slot' + (slot.filled !== null ? ' filled' : '');
    if(matchState.checked) cls += (slot.filled === slot.answer ? ' correct' : ' incorrect');
    div.className = cls;
    div.innerHTML = `<span class="match-slot-label">${slot.label}</span><span class="match-slot-text">${slot.filled !== null ? slot.filled : 'Koppints ide'}</span>`;
    div.onclick = () => onSlotClick(i);
    div.ondragover = (e) => e.preventDefault();
    div.ondrop = (e) => { e.preventDefault(); onSlotDrop(i, e.dataTransfer.getData('text/plain')); };
    slotsWrap.appendChild(div);
  });

  const bankWrap = document.getElementById('matchBankInner');
  bankWrap.innerHTML = '';
  matchState.bank.forEach((chip) => {
    if(chip.used) return;
    const div = document.createElement('div');
    div.className = 'match-chip' + (matchState.selected === chip.idx ? ' selected' : '');
    div.textContent = chip.text;
    div.draggable = true;
    div.ondragstart = (e) => { e.dataTransfer.setData('text/plain', String(chip.idx)); };
    div.onclick = () => onChipClick(chip.idx);
    bankWrap.appendChild(div);
  });

  document.getElementById('matchCheckBtn').disabled = matchState.checked || matchState.slots.some(s => s.filled === null);
}

function onChipClick(idx){
  if(matchState.checked) return;
  matchState.selected = (matchState.selected === idx) ? null : idx;
  renderMatchUI();
}

function returnSlotChipToBank(slot){
  if(slot.filled === null) return;
  const chip = matchState.bank.find(c => c.text === slot.filled && c.used);
  if(chip) chip.used = false;
  slot.filled = null;
}

function onSlotClick(i){
  if(matchState.checked) return;
  const slot = matchState.slots[i];
  if(matchState.selected !== null){
    const chip = matchState.bank.find(c => c.idx === matchState.selected);
    if(!chip) return;
    returnSlotChipToBank(slot);
    slot.filled = chip.text;
    chip.used = true;
    matchState.selected = null;
  } else {
    returnSlotChipToBank(slot);
  }
  renderMatchUI();
}

function onSlotDrop(i, idxStr){
  if(matchState.checked) return;
  const idx = parseInt(idxStr, 10);
  const chip = matchState.bank.find(c => c.idx === idx);
  if(!chip) return;
  const slot = matchState.slots[i];
  returnSlotChipToBank(slot);
  slot.filled = chip.text;
  chip.used = true;
  matchState.selected = null;
  renderMatchUI();
}

function checkMatching(){
  if(matchState.slots.some(s => s.filled === null)) return;
  matchState.checked = true;
  const correctCount = matchState.slots.filter(s => s.filled === s.answer).length;
  const total = matchState.slots.length;
  const fraction = correctCount / total;

  quizState.score += fraction;
  quizState.answered.push({
    type: 'match',
    group: matchState.group,
    correctCount, total,
    slots: matchState.slots.map(s => ({ label: s.label, answer: s.answer, given: s.filled }))
  });

  document.getElementById('quizScorePill').textContent = `Pontszám: ${quizState.score.toFixed(1)}`;
  const fb = document.getElementById('matchFeedback');
  fb.classList.add('show');
  fb.innerHTML = `<strong>${correctCount} / ${total} helyes párosítás.</strong>`;
  document.getElementById('quizNextBtn').disabled = false;
  renderMatchUI();
}
