/* =========================================================
   APP INIT
   Loads the card deck from data/cards.json, then builds the
   topic filter UI and enables the mode selector.

   NOTE: because the deck now loads via fetch(), this app must
   be served over http/https (GitHub Pages, or any local dev
   server such as `python3 -m http.server`). Opening index.html
   directly as a file:// URL will NOT work in most browsers,
   since they block fetch() requests to local files for
   security reasons.
   ========================================================= */

async function initApp(){
  try{
    await loadCards();
    initTopics();
    buildTopicList();
    document.querySelectorAll('.mode-card').forEach(btn => btn.disabled = false);
  }catch(err){
    console.error(err);
    const hero = document.querySelector('.hero');
    if(hero){
      const msg = document.createElement('p');
      msg.style.color = '#D99089';
      msg.style.fontWeight = '600';
      msg.textContent = 'Nem sikerült betölteni a tananyagot. Ha a fájlt közvetlenül nyitottad meg (file://), indítsd el egy helyi szerverrel (pl. "python3 -m http.server"), vagy nézd meg GitHub Pages-en.';
      hero.appendChild(msg);
    }
  }
}

initApp();
