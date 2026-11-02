const {traditions,passages,topics}=window.WS_DATA;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const feed=$("#feed");
const FEED_BATCH_SIZE=28;
const PRELOAD_SCREENS=9;
const params=new URLSearchParams(location.search);
const traditionParam=params.get("tradition");
const topicParam=params.get("topic");
const traditionMap={bible:"christianity",quran:"islam","bhagavad-gita":"hinduism",dhammapada:"buddhism",tanakh:"judaism","guru-granth-sahib":"sikhism","tao-te-ching":"taoism"};
const initialFilter=traditionMap[traditionParam]||traditionParam||"all";
const state={
  filter:traditions.some(t=>t.slug===initialFilter)?initialFilter:"all",
  topic:topics.includes(topicParam)?topicParam:null,
  langs:JSON.parse(localStorage.getItem("ws-langs")||"{}"),
  saved:JSON.parse(localStorage.getItem("ws-saved")||"[]"),
  interests:JSON.parse(localStorage.getItem("ws-interests")||'{"traditions":[],"topics":[]}'),
  textSize:localStorage.getItem("ws-text-size")||"default",
  audioRate:Number(localStorage.getItem("ws-audio-rate")||"0.95"),
  batch:0,activeId:null,lastRenderedId:null
};
const tradition=s=>traditions.find(t=>t.slug===s);
const language=slug=>{const t=tradition(slug),key=state.langs[slug]||"en";return t.languages.find(l=>l.key===key)||t.languages[0]};
const textFor=p=>p.text[language(p.tradition).key]||p.text.en;

function sourceList(){let list=state.filter==="all"?passages:passages.filter(p=>p.tradition===state.filter);if(state.topic)list=list.filter(p=>p.topics.includes(state.topic));return list.length?list:(state.filter==="all"?passages:passages.filter(p=>p.tradition===state.filter))}
function passageWeight(p){
  if(state.filter!=="all")return 1;
  let w=1;
  if(state.interests.traditions.includes(p.tradition))w+=5;
  w+=p.topics.filter(t=>state.interests.topics.includes(t)).length*2.5;
  return w;
}
function weightedPick(pool,recent){
  let eligible=pool.filter(p=>p.id!==state.lastRenderedId&&!recent.includes(p.id));
  if(!eligible.length)eligible=pool.filter(p=>p.id!==state.lastRenderedId);
  if(!eligible.length)eligible=pool;
  const weights=eligible.map(p=>passageWeight(p)),total=weights.reduce((a,b)=>a+b,0);
  let r=Math.random()*total;
  for(let i=0;i<eligible.length;i++){r-=weights[i];if(r<=0)return eligible[i]}
  return eligible[eligible.length-1];
}
function buildBatch(count,firstId=null){
  const pool=sourceList(),out=[],recent=[];
  if(firstId){
    const first=pool.find(p=>p.id===Number(firstId));
    if(first){out.push(first);recent.push(first.id);state.lastRenderedId=first.id}
  }
  while(out.length<count){
    const p=weightedPick(pool,recent);
    if(!p)break;
    out.push(p);state.lastRenderedId=p.id;recent.push(p.id);
    if(recent.length>Math.min(5,Math.max(1,pool.length-1)))recent.shift();
  }
  return out;
}
function passageMarkup(p){
  const t=tradition(p.tradition),lang=language(p.tradition),rtl=["ar","ur","he"].includes(lang.key);
  return `<div class="passage-wrap" dir="${rtl?"rtl":"ltr"}">
    <div class="eyebrow"><span class="symbol">${t.symbol}</span><span>${t.name} · ${t.faith}</span></div>
    <p class="passage">${textFor(p)}</p><p class="citation">${p.citation}</p><p class="source">${lang.label} · ${lang.source}</p>
  </div>
  <div class="actions">
    <button class="action" data-save-id="${p.id}" onclick="toggleSave(${p.id})" aria-label="Save ${p.citation}">${state.saved.includes(p.id)?"♥":"♡"}<small>Save</small></button>
    <button class="action" onclick="openStudy(${p.id})" aria-label="Study ${p.citation}">▣<small>Study</small></button>
    <button class="action" onclick="sharePassage(${p.id})" aria-label="Share ${p.citation}">↥<small>Share</small></button>
    <button class="action" onclick="speakPassage(${p.id})" aria-label="Listen to ${p.citation}">◖<small>Listen</small></button>
  </div><div class="scroll-hint">swipe up</div>`;
}
function renderBatch(reset=false,count=FEED_BATCH_SIZE,firstId=null){
  if(reset){feed.innerHTML="";state.batch=0;state.lastRenderedId=null}
  const list=buildBatch(count,firstId),frag=document.createDocumentFragment();
  list.forEach(p=>{const slide=document.createElement("section");slide.className="slide";slide.dataset.id=p.id;slide.dataset.batch=state.batch;slide.innerHTML=passageMarkup(p);frag.appendChild(slide)});
  feed.appendChild(frag);state.batch++;requestAnimationFrame(markCurrent);
}
let loading=false;
function ensureRunway(){
  const remaining=feed.scrollHeight-feed.scrollTop-feed.clientHeight;
  if(remaining<feed.clientHeight*PRELOAD_SCREENS&&!loading){
    loading=true;renderBatch(false,FEED_BATCH_SIZE);setTimeout(()=>{loading=false;ensureRunway()},40);
  }
}
feed.addEventListener("scroll",()=>{feed.classList.add("has-scrolled");requestAnimationFrame(()=>{markCurrent();ensureRunway()})},{passive:true});

function setView(id){$$(".view").forEach(v=>v.classList.toggle("active",v.id===id));$$(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===id));if(id==="you")renderYou()}
$$(".nav-btn").forEach(b=>b.onclick=()=>setView(b.dataset.view));
function sheet(content){$("#modal").innerHTML=`<div class="overlay" onclick="closeSheet()"><div class="sheet" onclick="event.stopPropagation()"><div class="grab"></div>${content}</div></div>`}
function closeSheet(){$("#modal").innerHTML=""}
function openFilter(){sheet(`<div class="sheet-head"><h2>Choose tradition</h2><button class="close" onclick="closeSheet()">×</button></div>${[{slug:"all",name:"All traditions",faith:"Mixed feed",symbol:"∞"},...traditions].map(t=>`<button class="choice" onclick="chooseFilter('${t.slug}')"><div class="choice-icon">${t.symbol}</div><div class="choice-main"><b>${t.name}</b><span>${t.faith}</span></div><div class="check">${state.filter===t.slug?"✓":""}</div></button>`).join("")}`)}
function chooseFilter(slug){state.filter=slug;state.topic=null;history.replaceState(null,"",location.pathname);closeSheet();updateHeader();renderBatch(true,FEED_BATCH_SIZE)}
function activePassage(){return passages.find(p=>p.id===Number(state.activeId))||sourceList()[0]}
function updateHeader(){const label=state.topic?state.topic.charAt(0).toUpperCase()+state.topic.slice(1):(state.filter==="all"?"All":tradition(state.filter).name);$("#filterBtn").textContent=label;const p=activePassage();$("#langBtn").textContent=p?language(p.tradition).short:"EN"}
function openLanguage(){const p=activePassage();if(!p)return;const t=tradition(p.tradition),cur=language(p.tradition);sheet(`<div class="sheet-head"><h2>${t.name} language</h2><button class="close" onclick="closeSheet()">×</button></div>${t.languages.map(l=>`<button class="choice" onclick="setLanguage('${t.slug}','${l.key}',${p.id})"><div class="choice-main"><b>${l.label}</b><span>${l.source}</span></div><div class="check">${cur.key===l.key?"●":"○"}</div></button>`).join("")}`)}
function setLanguage(slug,key,keepId){state.langs[slug]=key;localStorage.setItem("ws-langs",JSON.stringify(state.langs));closeSheet();state.activeId=Number(keepId);renderBatch(true,FEED_BATCH_SIZE,keepId);feed.scrollTop=0;renderYou();toast("Language updated")}
function toggleSave(id){state.saved=state.saved.includes(id)?state.saved.filter(x=>x!==id):[...state.saved,id];localStorage.setItem("ws-saved",JSON.stringify(state.saved));document.querySelectorAll('[data-save-id="'+id+'"]').forEach(btn=>btn.childNodes[0].nodeValue=state.saved.includes(id)?"♥":"♡");renderYou();toast(state.saved.includes(id)?"Saved":"Removed")}
function openStudy(id){const p=passages.find(x=>x.id===id),t=tradition(p.tradition),l=language(p.tradition);sheet(`<div class="study"><div class="sheet-head"><div><b>${p.citation}</b><div class="source">${t.faith} · ${l.label}</div></div><button class="close" onclick="closeSheet()">×</button></div><h3>Context</h3><p>${p.context}</p><div class="tag-row">${p.topics.map(x=>`<span>${x}</span>`).join("")}</div><p class="source" style="margin-top:18px">Text source: ${l.source}</p></div>`)}
function voiceFor(locale){const voices=speechSynthesis.getVoices(),base=locale.toLowerCase().split("-")[0];return voices.find(v=>v.lang.toLowerCase()===locale.toLowerCase())||voices.find(v=>v.lang.toLowerCase().startsWith(base))||null}
function speakPassage(id){const p=passages.find(x=>x.id===id),l=language(p.tradition);if(!("speechSynthesis" in window)){toast("Audio is not supported on this device");return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(textFor(p));u.lang=l.locale;u.rate=state.audioRate;const v=voiceFor(l.locale);if(v)u.voice=v;speechSynthesis.speak(u);toast("Playing in "+l.label)}
async function sharePassage(id){const p=passages.find(x=>x.id===id),v=textFor(p)+" — "+p.citation;try{if(navigator.share)await navigator.share({title:p.citation,text:v,url:location.origin+"/?passage="+id});else{await navigator.clipboard.writeText(v+"\n"+location.origin+"/?passage="+id);toast("Copied")}}catch{}}
function jumpTo(id){state.filter="all";state.topic=null;setView("home");updateHeader();renderBatch(true,FEED_BATCH_SIZE,id);feed.scrollTop=0}
function renderYou(){
  $("#savedCount").textContent=state.saved.length;
  const savedPassages=passages.filter(p=>state.saved.includes(p.id));
  $("#savedList").innerHTML=savedPassages.length?savedPassages.map(p=>{const t=tradition(p.tradition);return `<button class="saved-item setting-link" onclick="jumpTo(${p.id})"><div class="saved-item-mark">${t.symbol}</div><div class="saved-item-copy"><b>${p.citation}</b><span>${textFor(p)}</span></div><i>›</i></button>`}).join(""):'<div class="saved-empty">Nothing saved yet. Tap ♡ on any passage.</div>';
  $("#traditionInterests").innerHTML=traditions.map(t=>`<button class="interest-chip ${state.interests.traditions.includes(t.slug)?"active":""}" onclick="toggleInterest('traditions','${t.slug}')">${t.name}</button>`).join("");
  $("#topicInterests").innerHTML=topics.map(t=>`<button class="interest-chip ${state.interests.topics.includes(t)?"active":""}" onclick="toggleInterest('topics','${t}')">${t}</button>`).join("");
  $$("[data-text-size]").forEach(b=>b.classList.toggle("active",b.dataset.textSize===state.textSize));
  $$("[data-audio-rate]").forEach(b=>b.classList.toggle("active",Number(b.dataset.audioRate)===state.audioRate));
  const custom=Object.keys(state.langs).filter(k=>state.langs[k]&&state.langs[k]!=="en").length;$("#languageSummary").textContent=custom?custom+" scripture language preference"+(custom>1?"s":"")+" set":"English by default · set per scripture";
}
function toggleInterest(type,value){const a=state.interests[type],i=a.indexOf(value);if(i>=0)a.splice(i,1);else a.push(value);localStorage.setItem("ws-interests",JSON.stringify(state.interests));renderYou()}
function applyTextSize(){document.body.classList.remove("text-size-small","text-size-large");if(state.textSize==="small")document.body.classList.add("text-size-small");if(state.textSize==="large")document.body.classList.add("text-size-large")}
function openLanguageOverview(){sheet(`<div class="sheet-head"><h2>Scripture languages</h2><button class="close" onclick="closeSheet()">×</button></div>${traditions.map(t=>{const l=language(t.slug);return `<button class="choice" onclick="openLanguageFor('${t.slug}')"><div class="choice-icon">${t.symbol}</div><div class="choice-main"><b>${t.name}</b><span>${l.label}</span></div><div class="check">›</div></button>`}).join("")}`)}
function openLanguageFor(slug){const t=tradition(slug),cur=language(slug);sheet(`<div class="sheet-head"><h2>${t.name} language</h2><button class="close" onclick="closeSheet()">×</button></div>${t.languages.map(l=>`<button class="choice" onclick="setLanguageFromYou('${slug}','${l.key}')"><div class="choice-main"><b>${l.label}</b><span>${l.source}</span></div><div class="check">${cur.key===l.key?"●":"○"}</div></button>`).join("")}`)}
function setLanguageFromYou(slug,key){state.langs[slug]=key;localStorage.setItem("ws-langs",JSON.stringify(state.langs));closeSheet();renderYou();toast("Language updated")}
function resetPreferences(){state.interests={traditions:[],topics:[]};state.textSize="default";state.audioRate=.95;localStorage.removeItem("ws-interests");localStorage.removeItem("ws-text-size");localStorage.removeItem("ws-audio-rate");applyTextSize();renderYou();toast("Preferences reset")}
function clearSaved(){state.saved=[];localStorage.setItem("ws-saved","[]");renderYou();document.querySelectorAll("[data-save-id]").forEach(btn=>btn.childNodes[0].nodeValue="♡");toast("Saved passages cleared")}
function markCurrent(){const center=feed.getBoundingClientRect().top+feed.clientHeight/2;let best=null,d=Infinity;document.querySelectorAll(".slide").forEach(s=>{const r=s.getBoundingClientRect(),dist=Math.abs((r.top+r.height/2)-center);if(dist<d){d=dist;best=s}});document.querySelectorAll(".slide").forEach(s=>s.classList.toggle("current",s===best));if(best){state.activeId=Number(best.dataset.id);updateHeader()}}
$("#filterBtn").onclick=openFilter;$("#langBtn").onclick=openLanguage;
$("#textSizeControl").onclick=e=>{const b=e.target.closest("[data-text-size]");if(!b)return;state.textSize=b.dataset.textSize;localStorage.setItem("ws-text-size",state.textSize);applyTextSize();renderYou()};
$("#audioRateControl").onclick=e=>{const b=e.target.closest("[data-audio-rate]");if(!b)return;state.audioRate=Number(b.dataset.audioRate);localStorage.setItem("ws-audio-rate",String(state.audioRate));renderYou()};
function toast(msg){const e=document.createElement("div");e.className="toast";e.textContent=msg;document.body.appendChild(e);setTimeout(()=>e.remove(),1300)}
function syncSeed(){
  document.querySelectorAll("[data-save-id]").forEach(btn=>{const id=Number(btn.dataset.saveId);btn.childNodes[0].nodeValue=state.saved.includes(id)?"♥":"♡"});
  const slides=$$(".slide");if(slides.length){state.lastRenderedId=Number(slides[slides.length-1].dataset.id);state.activeId=Number(slides[0].dataset.id)}
}
applyTextSize();renderYou();syncSeed();updateHeader();
if(state.filter!=="all"||state.topic||state.interests.traditions.length||state.interests.topics.length||Object.keys(state.langs).some(k=>state.langs[k]!=="en"))renderBatch(true,FEED_BATCH_SIZE);
else ensureRunway();
const deep=params.get("passage");if(deep)setTimeout(()=>jumpTo(Number(deep)),50);