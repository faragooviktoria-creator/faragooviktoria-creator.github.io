/* =========================================================
   QUIZ MODE
   Mixes ordinary multiple-choice questions with whole-diagram
   drag-and-drop matching puzzles (js/matching.js) into one
   quiz sequence.
   ========================================================= */

let quizState = null;

function buildQuizUnits(rawPool){
  const abraSections = new Set(
    rawPool.filter(c => c.section.startsWith('Ábra:')).map(c => c.section)
  );
  const textCards = rawPool.filter(c => !c.section.startsWith('Ábra:'));
  const matchGroups = MATCH_GROUPS.filter(g => abraSections.has(g.section));

  const mcqUnits = textCards.map(c => ({ type: 'mcq', card: c }));
  const matchUnits = matchGroups.map(g => ({ type: 'match', group: g }));
  return [...mcqUnits, ...matchUnits];
}

function beginQuiz(pool, rawPoolOverride){
  const rawPool = rawPoolOverride || pool;
  const unitPool = buildQuizUnits(rawPool);
  const count = Math.min(10, unitPool.length);
  const units = shuffleArr(unitPool).slice(0, count);
  quizState = {
    rawPool,
    units,
    index: 0,
    score: 0,
    answered: [],
    locked: false,
    correctBtn: null
  };
  showView('view-quiz');
  renderQuizUnit();
}
function restartCurrentQuiz(){
  beginQuiz(getFilteredCards(), quizState.rawPool);
}

function renderQuizUnit(){
  const unit = quizState.units[quizState.index];
  document.getElementById('quizProgressLabel').textContent = `${quizState.index+1} / ${quizState.units.length}`;
  document.getElementById('quizProgressFill').style.width = `${(quizState.index/quizState.units.length)*100}%`;
  document.getElementById('quizScorePill').textContent = `Pontszám: ${quizState.score % 1 === 0 ? quizState.score : quizState.score.toFixed(1)}`;
  document.getElementById('quizNextBtn').disabled = true;
  document.getElementById('quizNextBtn').textContent = (quizState.index === quizState.units.length-1) ? 'Eredmény megtekintése' : 'Következő';

  if(unit.type === 'match'){
    renderMatchUnit(unit.group);
  } else {
    document.getElementById('quizMatchBlock').style.display = 'none';
    document.getElementById('quizMcqBlock').style.display = 'block';
    renderQuizQuestion(unit.card);
  }
}

function renderQuizQuestion(q){
  document.getElementById('quizTag').textContent = q.section;
  const quizImg = document.getElementById('quizImage');
  if(q.img){ quizImg.src = q.img; quizImg.style.display='block'; }
  else { quizImg.style.display='none'; quizImg.removeAttribute('src'); }
  document.getElementById('quizQuestion').textContent = q.q;
  document.getElementById('quizFeedback').classList.remove('show');
  document.getElementById('quizFeedback').textContent = '';

  const options = makeOptions(q, quizState.rawPool);
  quizState.locked = false;

  const wrap = document.getElementById('quizOptions');
  wrap.innerHTML='';
  const letters = ['A','B','C','D'];
  quizState.correctBtn = null;
  options.forEach((opt, i)=>{
    const btn = document.createElement('button');
    btn.className='option-btn';
    btn.innerHTML = `<span class="letter">${letters[i]}</span><span>${opt}</span>`;
    if(opt === q.a) quizState.correctBtn = btn;
    btn.onclick = ()=>selectQuizOption(btn, opt, q);
    wrap.appendChild(btn);
  });
}

function selectQuizOption(btn, opt, q){
  if(quizState.locked) return;
  quizState.locked = true;
  const correct = opt === q.a;
  document.querySelectorAll('#quizOptions .option-btn').forEach(b=>{ b.disabled = true; });
  if(quizState.correctBtn) quizState.correctBtn.classList.add('correct');
  if(!correct) btn.classList.add('incorrect');
  else quizState.score++;

  quizState.answered.push({ type:'mcq', q, chosen: opt, correct });

  const fb = document.getElementById('quizFeedback');
  fb.classList.add('show');
  fb.innerHTML = correct
    ? `<strong>Helyes!</strong> ${q.a}`
    : `<strong>Nem egészen.</strong> A helyes válasz: ${q.a}`;

  document.getElementById('quizScorePill').textContent = `Pontszám: ${quizState.score % 1 === 0 ? quizState.score : quizState.score.toFixed(1)}`;
  document.getElementById('quizNextBtn').disabled = false;
}

function quizNext(){
  if(quizState.index < quizState.units.length-1){
    quizState.index++;
    renderQuizUnit();
  } else {
    finishQuiz();
  }
}

function finishQuiz(){
  const total = quizState.units.length;
  const pct = Math.round((quizState.score/total)*100);
  document.getElementById('quizFinalScore').textContent = pct + '%';
  const scoreLabel = quizState.score % 1 === 0 ? quizState.score : quizState.score.toFixed(1);
  document.getElementById('quizFinalSub').textContent = `${scoreLabel} / ${total} pont`;

  const list = document.getElementById('quizReviewList');
  list.innerHTML='';
  const mistakes = quizState.answered.filter(a => a.type==='mcq' ? !a.correct : a.correctCount < a.total);
  if(mistakes.length){
    const h = document.createElement('p');
    h.style.fontWeight='600'; h.style.marginBottom='10px'; h.textContent='Érdemes átnézni:';
    list.appendChild(h);
    mistakes.forEach(m=>{
      const div = document.createElement('div');
      div.className='review-item';
      if(m.type === 'mcq'){
        div.innerHTML = `<div class="rq">${m.q.q}</div>
          <div class="ra wrong">Te válaszod: ${m.chosen}</div>
          <div class="ra right">Helyes válasz: ${m.q.a}</div>`;
      } else {
        const wrongRows = m.slots.filter(s => s.given !== s.answer)
          .map(s => `<div class="ra wrong">${s.label}: ${s.given} <span class="ra right">→ ${s.answer}</span></div>`)
          .join('');
        div.innerHTML = `<div class="rq">${m.group.section} (${m.correctCount} / ${m.total} helyes)</div>${wrongRows}`;
      }
      list.appendChild(div);
    });
  }
  showView('view-quiz-results');
}
