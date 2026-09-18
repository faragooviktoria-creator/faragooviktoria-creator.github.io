/* =========================================================
   EXAM MODE
   ========================================================= */

let examState = null;
let examTimerInterval = null;

function beginExamSetup(pool){
  examState = { pool };
  const grid = document.getElementById('examQtyGrid');
  grid.innerHTML='';
  const options = [10,25,50,pool.length];
  const uniqueOptions = [...new Set(options)].filter(n=>n>0);
  let chosen = uniqueOptions[0];
  uniqueOptions.forEach((n)=>{
    const btn = document.createElement('button');
    btn.className='qty-btn' + (n===chosen ? ' active':'');
    btn.textContent = (n===pool.length && !options.slice(0,3).includes(n)) ? `Összes (${n})` : n;
    btn.onclick = ()=>{
      document.querySelectorAll('.qty-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      examState.qty = n;
      updateExamTimerNote();
    };
    grid.appendChild(btn);
  });
  examState.qty = chosen;
  updateExamTimerNote();
  showView('view-exam-setup');
}
function updateExamTimerNote(){
  const seconds = examState.qty * 45;
  const mins = Math.round(seconds/60);
  document.getElementById('examTimerNote').textContent = `Időkorlát: kb. ${mins} perc (kérdésenként 45 másodperc)`;
}
function goExamSetup(){ beginExamSetup(getFilteredCards()); }

function startExam(){
  const n = Math.min(examState.qty, examState.pool.length);
  const questions = shuffleArr(examState.pool).slice(0, n);
  const optionsPerQ = questions.map(q => makeOptions(q, examState.pool));
  examState = {
    ...examState,
    questions,
    optionsPerQ,
    index: 0,
    answers: new Array(questions.length).fill(null),
    totalSeconds: questions.length * 45,
    remaining: questions.length * 45,
    startTime: Date.now()
  };
  buildExamNavGrid();
  showView('view-exam');
  renderExamQuestion();
  startExamTimer();
}

function startExamTimer(){
  clearInterval(examTimerInterval);
  examTimerInterval = setInterval(()=>{
    examState.remaining--;
    updateExamTimerDisplay();
    if(examState.remaining<=0){
      clearInterval(examTimerInterval);
      finishExam();
    }
  },1000);
  updateExamTimerDisplay();
}
function updateExamTimerDisplay(){
  const m = Math.floor(examState.remaining/60);
  const s = examState.remaining%60;
  const el = document.getElementById('examTimer');
  el.textContent = `⏱ ${m}:${s.toString().padStart(2,'0')}`;
  el.classList.toggle('low', examState.remaining <= 30);
}

function buildExamNavGrid(){
  const grid = document.getElementById('examNavGrid');
  grid.innerHTML='';
  examState.questions.forEach((q,i)=>{
    const dot = document.createElement('button');
    dot.className='exam-dot';
    dot.textContent = i+1;
    dot.onclick = ()=>{ examState.index = i; renderExamQuestion(); };
    grid.appendChild(dot);
  });
}
function refreshExamNavGrid(){
  document.querySelectorAll('.exam-dot').forEach((dot,i)=>{
    dot.classList.toggle('answered', examState.answers[i]!==null);
    dot.classList.toggle('current', i===examState.index);
  });
}

function renderExamQuestion(){
  const q = examState.questions[examState.index];
  document.getElementById('examTag').textContent = q.section;
  const examImg = document.getElementById('examImage');
  if(q.img){ examImg.src = q.img; examImg.style.display='block'; }
  else { examImg.style.display='none'; examImg.removeAttribute('src'); }
  document.getElementById('examQuestion').textContent = q.q;
  document.getElementById('examProgressLabel').textContent = `${examState.index+1} / ${examState.questions.length}`;
  document.getElementById('examProgressFill').style.width = `${(examState.index/examState.questions.length)*100}%`;

  const wrap = document.getElementById('examOptions');
  wrap.innerHTML='';
  const letters=['A','B','C','D'];
  const options = examState.optionsPerQ[examState.index];
  const chosen = examState.answers[examState.index];
  options.forEach((opt,i)=>{
    const btn = document.createElement('button');
    btn.className='option-btn' + (chosen===opt ? ' selected':'');
    btn.innerHTML = `<span class="letter">${letters[i]}</span><span>${opt}</span>`;
    btn.onclick = ()=>{
      examState.answers[examState.index] = opt;
      renderExamQuestion();
      refreshExamNavGrid();
    };
    wrap.appendChild(btn);
  });
  document.getElementById('examNextBtn').textContent =
    (examState.index === examState.questions.length-1) ? 'Vizsga beadása' : 'Következő';
  refreshExamNavGrid();
}
function examNext(){
  if(examState.index < examState.questions.length-1){
    examState.index++;
    renderExamQuestion();
  } else {
    finishExam();
  }
}
function examPrev(){
  if(examState.index>0){
    examState.index--;
    renderExamQuestion();
  }
}
function finishExam(){
  clearInterval(examTimerInterval);
  const timeTaken = examState.totalSeconds - Math.max(examState.remaining,0);
  let correctCount = 0;
  const results = examState.questions.map((q,i)=>{
    const chosen = examState.answers[i];
    const correct = chosen === q.a;
    if(correct) correctCount++;
    return { q, chosen, correct };
  });
  const total = examState.questions.length;
  const pct = Math.round((correctCount/total)*100);
  document.getElementById('examFinalScore').textContent = pct+'%';
  const mm = Math.floor(timeTaken/60), ss = timeTaken%60;
  document.getElementById('examFinalSub').textContent =
    `${correctCount} / ${total} helyes · ${mm}:${ss.toString().padStart(2,'0')} alatt`;

  const list = document.getElementById('examReviewList');
  list.innerHTML='';
  const h = document.createElement('p');
  h.style.fontWeight='600'; h.style.marginBottom='10px'; h.textContent='Részletes áttekintés:';
  list.appendChild(h);
  results.forEach(r=>{
    const div = document.createElement('div');
    div.className='review-item';
    const chosenText = r.chosen === null ? '(nincs válasz)' : r.chosen;
    div.innerHTML = `<div class="rq">${r.q.q}</div>
      <div class="ra ${r.correct ? 'right':'wrong'}">Te válaszod: ${chosenText}</div>
      ${r.correct ? '' : `<div class="ra right">Helyes válasz: ${r.q.a}</div>`}`;
    list.appendChild(div);
  });
  showView('view-exam-results');
}
