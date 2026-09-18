/* =========================================================
   QUIZ MODE
   ========================================================= */

let quizState = null;

function beginQuiz(pool, sourcePoolOverride){
  const base = sourcePoolOverride || pool;
  const count = Math.min(10, base.length);
  const questions = shuffleArr(base).slice(0, count);
  quizState = {
    pool: base,
    questions,
    index: 0,
    score: 0,
    answered: [],
    currentOptions: null,
    locked: false
  };
  showView('view-quiz');
  renderQuizQuestion();
}
function restartCurrentQuiz(){
  beginQuiz(getFilteredCards(), quizState.pool);
}

function renderQuizQuestion(){
  const q = quizState.questions[quizState.index];
  document.getElementById('quizTag').textContent = q.section;
  const quizImg = document.getElementById('quizImage');
  if(q.img){ quizImg.src = q.img; quizImg.style.display='block'; }
  else { quizImg.style.display='none'; quizImg.removeAttribute('src'); }
  document.getElementById('quizQuestion').textContent = q.q;
  document.getElementById('quizProgressLabel').textContent = `${quizState.index+1} / ${quizState.questions.length}`;
  document.getElementById('quizProgressFill').style.width = `${(quizState.index/quizState.questions.length)*100}%`;
  document.getElementById('quizScorePill').textContent = `Pontszám: ${quizState.score}`;
  document.getElementById('quizFeedback').classList.remove('show');
  document.getElementById('quizFeedback').textContent = '';
  document.getElementById('quizNextBtn').disabled = true;
  document.getElementById('quizNextBtn').textContent = (quizState.index === quizState.questions.length-1) ? 'Eredmény megtekintése' : 'Következő';

  const options = makeOptions(q, quizState.pool);
  quizState.currentOptions = options;
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

  quizState.answered.push({ q, chosen: opt, correct });

  const fb = document.getElementById('quizFeedback');
  fb.classList.add('show');
  fb.innerHTML = correct
    ? `<strong>Helyes!</strong> ${q.a}`
    : `<strong>Nem egészen.</strong> A helyes válasz: ${q.a}`;

  document.getElementById('quizScorePill').textContent = `Pontszám: ${quizState.score}`;
  document.getElementById('quizNextBtn').disabled = false;
}

function quizNext(){
  if(quizState.index < quizState.questions.length-1){
    quizState.index++;
    renderQuizQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz(){
  const total = quizState.questions.length;
  const pct = Math.round((quizState.score/total)*100);
  document.getElementById('quizFinalScore').textContent = pct + '%';
  document.getElementById('quizFinalSub').textContent = `${quizState.score} / ${total} helyes válasz`;

  const wrongs = quizState.answered.filter(a=>!a.correct);
  const list = document.getElementById('quizReviewList');
  list.innerHTML='';
  if(wrongs.length){
    const h = document.createElement('p');
    h.style.fontWeight='600'; h.style.marginBottom='10px'; h.textContent='Érdemes átnézni:';
    list.appendChild(h);
    wrongs.forEach(w=>{
      const div = document.createElement('div');
      div.className='review-item';
      div.innerHTML = `<div class="rq">${w.q.q}</div>
        <div class="ra wrong">Te válaszod: ${w.chosen}</div>
        <div class="ra right">Helyes válasz: ${w.q.a}</div>`;
      list.appendChild(div);
    });
  }
  showView('view-quiz-results');
}
