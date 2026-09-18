/* =========================================================
   VIEW SWITCHING
   ========================================================= */

function showView(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active','fade-in'));
  const v = document.getElementById(id);
  v.classList.add('active','fade-in');
  document.getElementById('homeBtn').classList.toggle('show', id !== 'view-home');
  window.scrollTo({top:0, behavior:'smooth'});
}
function goHome(){ showView('view-home'); }

function startModeSelect(mode){
  const pool = getFilteredCards();
  if(pool.length < 4){
    alert('Legalább 4 kérdés szükséges a kiválasztott témakörökben. Válassz több témát.');
    return;
  }
  if(mode==='quiz') beginQuiz(pool);
  else if(mode==='flash') beginFlash(pool);
  else if(mode==='exam') beginExamSetup(pool);
}
