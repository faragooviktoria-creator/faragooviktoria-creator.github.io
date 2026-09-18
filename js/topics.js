/* =========================================================
   TOPIC FILTER STATE
   ========================================================= */

let SECTIONS = [];
let selectedTopics = new Set();

function initTopics(){
  SECTIONS = [...new Set(CARDS.map(c=>c.section))];
  selectedTopics = new Set(SECTIONS); // all selected by default
}

function buildTopicList(){
  const list = document.getElementById('topicList');
  list.innerHTML = '';
  SECTIONS.forEach(sec=>{
    const count = CARDS.filter(c=>c.section===sec).length;
    const wrap = document.createElement('label');
    wrap.className='topic-item';
    wrap.innerHTML = `<input type="checkbox" checked data-sec="${encodeURIComponent(sec)}" onchange="onTopicToggle(this)"> <span>${sec}</span> <span class="count">(${count})</span>`;
    list.appendChild(wrap);
  });
}
function onTopicToggle(el){
  const sec = decodeURIComponent(el.dataset.sec);
  if(el.checked) selectedTopics.add(sec); else selectedTopics.delete(sec);
}
function toggleAllTopics(state){
  document.querySelectorAll('#topicList input[type=checkbox]').forEach(cb=>{ cb.checked = state; });
  selectedTopics = state ? new Set(SECTIONS) : new Set();
}
function getFilteredCards(){
  const arr = CARDS.filter(c=>selectedTopics.has(c.section));
  return arr.length ? arr : CARDS.slice();
}
