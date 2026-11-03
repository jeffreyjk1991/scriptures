const {traditions,passages,topics}=window.WS_DATA;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const feed=$("#feed");
const FEED_BATCH_SIZE=28;
const PRELOAD_SCREENS=9;
const params=new URLSearchParams(location.search);
const versePathMatch=location.pathname.match(/^\/verse\/(\d+)\/?$/);
const passageParam=params.get("passage")||(versePathMatch?versePathMatch[1]:null);
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
  seenIds:new Set(JSON.parse(sessionStorage.getItem("ws-feed-seen-v2")||"[]")),
  recentIds:JSON.parse(sessionStorage.getItem("ws-feed-recent-v2")||"[]"),
  hadSeenHistory:JSON.parse(sessionStorage.getItem("ws-feed-seen-v2")||"[]").length>0,
  batch:0,activeId:null,lastRenderedId:null
};
const tradition=s=>traditions.find(t=>t.slug===s);
const language=slug=>{const t=tradition(slug),key=state.langs[slug]||"en";return t.languages.find(l=>l.key===key)||t.languages[0]};
const languageForPassage=p=>{
  const preferred=language(p.tradition);
  if(p.text[preferred.key])return preferred;
  const t=tradition(p.tradition);
  return t.languages.find(l=>l.key==="en")||t.languages[0];
};
const textFor=p=>p.text[languageForPassage(p).key]||p.text.en;

function sourceList(){let list=state.filter==="all"?passages:passages.filter(p=>p.tradition===state.filter);if(state.topic)list=list.filter(p=>p.topics.includes(state.topic));return list.length?list:(state.filter==="all"?passages:passages.filter(p=>p.tradition===state.filter))}
function passageWeight(p){
  if(state.filter!=="all")return 1;
  let w=1;
  if(state.interests.traditions.includes(p.tradition))w+=5;
  w+=p.topics.filter(t=>state.interests.topics.includes(t)).length*2.5;
  return w;
}
function persistFeedHistory(){
  try{
    sessionStorage.setItem("ws-feed-seen-v2",JSON.stringify([...state.seenIds]));
    sessionStorage.setItem("ws-feed-recent-v2",JSON.stringify(state.recentIds.slice(-8)));
  }catch{}
}
function markSeen(id){
  const n=Number(id);
  state.seenIds.add(n);
  state.recentIds=state.recentIds.filter(x=>x!==n);
  state.recentIds.push(n);
  if(state.recentIds.length>8)state.recentIds=state.recentIds.slice(-8);
  state.lastRenderedId=n;
  persistFeedHistory();
}
function weightedPick(pool){
  if(!pool.length)return null;
  let eligible=pool.filter(p=>!state.recentIds.includes(p.id)&&p.id!==state.lastRenderedId);
  if(!eligible.length)eligible=pool.filter(p=>p.id!==state.lastRenderedId);
  if(!eligible.length)eligible=pool;
  const weights=eligible.map(p=>passageWeight(p)),total=weights.reduce((a,b)=>a+b,0);
  let r=Math.random()*total;
  for(let i=0;i<eligible.length;i++){r-=weights[i];if(r<=0)return eligible[i]}
  return eligible[eligible.length-1];
}
function beginNextCycle(pool){
  pool.forEach(p=>state.seenIds.delete(p.id));
  persistFeedHistory();
}
function buildBatch(count,firstId=null){
  const pool=sourceList(),out=[];
  if(!pool.length)return out;

  if(firstId){
    const first=pool.find(p=>p.id===Number(firstId));
    if(first){out.push(first);markSeen(first.id)}
  }

  let available=pool.filter(p=>!state.seenIds.has(p.id)&&!out.some(x=>x.id===p.id));

  // Only reset after the entire eligible corpus has been seen.
  // Never reset in the middle of a batch; that prevents duplicates inside a loaded run.
  if(!available.length&&out.length===0){
    beginNextCycle(pool);
    available=pool.filter(p=>!state.recentIds.includes(p.id));
    if(!available.length)available=[...pool];
  }

  while(out.length<count&&available.length){
    const p=weightedPick(available);
    if(!p)break;
    out.push(p);
    markSeen(p.id);
    available=available.filter(x=>x.id!==p.id);
  }
  return out;
}
function passageMarkup(p){
  const t=tradition(p.tradition),lang=languageForPassage(p),rtl=["ar","ur","he"].includes(lang.key);
  return `<div class="passage-wrap" dir="${rtl?"rtl":"ltr"}">
    <div class="eyebrow"><span class="symbol">${t.symbol}</span><span>${t.name} · ${t.faith}</span></div>
    <p class="passage">${textFor(p)}</p><p class="citation">${p.citation}</p><p class="source">${lang.label} · ${(lang.key==="en"&&p.source)?p.source:lang.source}</p>
  </div>
  <div class="actions">
    <button class="action" data-save-id="${p.id}" onclick="toggleSave(${p.id})" aria-label="Save ${p.citation}">${state.saved.includes(p.id)?"♥":"♡"}<small>Save</small></button>
    <button class="action" onclick="openStudy(${p.id})" aria-label="Study ${p.citation}"><svg class="action-glyph study-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h4.7c1.9 0 3.3.9 3.3 2.4v10.6c-.6-1.3-1.8-2.1-3.5-2.1H4V5.5Z"></path><path d="M20 5.5h-4.7c-1.9 0-3.3.9-3.3 2.4v10.6c.6-1.3 1.8-2.1 3.5-2.1H20V5.5Z"></path></svg><small>Study</small></button>
    <button class="action" onclick="sharePassage(${p.id})" aria-label="Share ${p.citation}"><svg class="action-glyph share-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3"></path><path d="M7.5 7.5 12 3l4.5 4.5"></path><path d="M5 11v8h14v-8"></path></svg><small>Share</small></button>
    <button class="action" onclick="speakPassage(${p.id})" aria-label="Listen to ${p.citation}"><svg class="action-glyph listen-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6L8 10H4Z"></path><path d="M16 9.2c1 .8 1.6 1.7 1.6 2.8s-.6 2-1.6 2.8"></path><path d="M18.6 6.8c1.8 1.5 2.9 3.2 2.9 5.2s-1.1 3.7-2.9 5.2"></path></svg><small>Listen</small></button>
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
function updateHeader(){const label=state.topic?state.topic.charAt(0).toUpperCase()+state.topic.slice(1):(state.filter==="all"?"All":tradition(state.filter).name);$("#filterBtn").textContent=label;const p=activePassage();$("#langBtn").textContent=p?languageForPassage(p).short:"EN"}
function openLanguage(){const p=activePassage();if(!p)return;const t=tradition(p.tradition),cur=language(p.tradition);sheet(`<div class="sheet-head"><h2>${t.name} language</h2><button class="close" onclick="closeSheet()">×</button></div>${t.languages.map(l=>`<button class="choice" onclick="setLanguage('${t.slug}','${l.key}',${p.id})"><div class="choice-main"><b>${l.label}</b><span>${l.source}</span></div><div class="check">${cur.key===l.key?"●":"○"}</div></button>`).join("")}`)}
function setLanguage(slug,key,keepId){state.langs[slug]=key;localStorage.setItem("ws-langs",JSON.stringify(state.langs));closeSheet();state.activeId=Number(keepId);renderBatch(true,FEED_BATCH_SIZE,keepId);feed.scrollTop=0;renderYou();toast("Language updated")}
function toggleSave(id){state.saved=state.saved.includes(id)?state.saved.filter(x=>x!==id):[...state.saved,id];localStorage.setItem("ws-saved",JSON.stringify(state.saved));document.querySelectorAll('[data-save-id="'+id+'"]').forEach(btn=>btn.childNodes[0].nodeValue=state.saved.includes(id)?"♥":"♡");renderYou();toast(state.saved.includes(id)?"Saved":"Removed")}
function openStudy(id){
  const p=passages.find(x=>x.id===id),t=tradition(p.tradition),l=languageForPassage(p);
  const themes=p.topics.map(x=>x.charAt(0).toUpperCase()+x.slice(1));
  const themeText=themes.length>1?themes.slice(0,-1).join(", ")+" and "+themes[themes.length-1]:themes[0]||"reflection";
  sheet(`<div class="study">
    <div class="sheet-head"><div><b>${p.citation}</b><div class="source">${t.name} · ${t.faith}</div></div><button class="close" onclick="closeSheet()">×</button></div>
    <h3>Context</h3>
    <div class="study-section">
      <div class="study-label">Background</div>
      <p>${p.context}</p>
    </div>
    <div class="study-section">
      <div class="study-label">What to notice</div>
      <p>This passage brings together themes of ${themeText}. Read it as part of its wider tradition, not only as an isolated quote, and notice what it asks the reader to trust, practice, release, or understand.</p>
    </div>
    <div class="study-section">
      <div class="study-label">Where it comes from</div>
      <p><strong>${p.citation}</strong> is presented here from ${t.name}, within ${t.faith}. You are reading it in ${l.label} using ${(l.key==="en"&&p.source)?p.source:l.source}.</p>
    </div>
    <div class="study-label study-label-themes">Themes</div>
    <div class="tag-row">${p.topics.map(x=>`<span>${x}</span>`).join("")}</div>
    <div class="study-meta"><span>Text source</span><b>${(l.key==="en"&&p.source)?p.source:l.source}</b></div>
  </div>`);
}
function voiceFor(locale){const voices=speechSynthesis.getVoices(),base=locale.toLowerCase().split("-")[0];return voices.find(v=>v.lang.toLowerCase()===locale.toLowerCase())||voices.find(v=>v.lang.toLowerCase().startsWith(base))||null}
function speakPassage(id){const p=passages.find(x=>x.id===id),l=languageForPassage(p);if(!("speechSynthesis" in window)){toast("Audio is not supported on this device");return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(textFor(p));u.lang=l.locale;u.rate=state.audioRate;const v=voiceFor(l.locale);if(v)u.voice=v;speechSynthesis.speak(u);toast("Playing in "+l.label)}
function passageShareUrl(id){
  const canonical=(location.hostname==="scrollmyfaith.com"||location.hostname==="www.scrollmyfaith.com")?location.origin:"https://www.scrollmyfaith.com";
  return canonical+"/verse/"+Number(id);
}
async function sharePassage(id){
  const p=passages.find(x=>x.id===id);
  if(!p)return;
  const url=passageShareUrl(id),v=textFor(p)+" — "+p.citation;
  try{
    if(navigator.share)await navigator.share({title:p.citation+" · Scroll My Faith",text:v,url});
    else{await navigator.clipboard.writeText(v+"\n"+url);toast("Verse link copied")}
  }catch{}
}
function jumpTo(id){state.filter="all";state.topic=null;setView("home");updateHeader();renderBatch(true,FEED_BATCH_SIZE,id);feed.scrollTop=0}
function renderYou(){
  const savedCount=$("#savedCount");
  if(savedCount)savedCount.textContent=state.saved.length;
  const interestSummary=$("#interestSummary");
  const interestCount=state.interests.traditions.length+state.interests.topics.length;
  if(interestSummary)interestSummary.textContent=interestCount?interestCount+" selected":"All";
  const readingSummary=$("#readingSummary");
  const customLang=Object.keys(state.langs).some(k=>state.langs[k]&&state.langs[k]!=="en");
  const customized=state.textSize!=="default"||state.audioRate!==.95||customLang;
  if(readingSummary)readingSummary.textContent=customized?"Customized":"Default";
}
function openSavedMenu(){
  const savedPassages=passages.filter(p=>state.saved.includes(p.id));
  const content=savedPassages.length?savedPassages.map(p=>{const t=tradition(p.tradition);return `<button class="choice saved-sheet-row" onclick="closeSheet();jumpTo(${p.id})"><div class="choice-icon">${t.symbol}</div><div class="choice-main"><b>${p.citation}</b><span>${textFor(p)}</span></div><div class="check">›</div></button>`}).join(""):'<div class="sheet-empty">No saved passages yet.</div>';
  sheet(`<div class="sheet-head"><h2>Saved</h2><button class="close" onclick="closeSheet()">×</button></div>${content}`);
}
function openPersonalizeMenu(){
  sheet(`<div class="sheet-head"><h2>Personalize</h2><button class="close" onclick="closeSheet()">×</button></div>
    <div class="mini-section"><div class="mini-label">Traditions</div><div class="interest-chips">${traditions.map(t=>`<button class="interest-chip ${state.interests.traditions.includes(t.slug)?"active":""}" onclick="toggleInterest('traditions','${t.slug}')">${t.name}</button>`).join("")}</div></div>
    <div class="mini-section"><div class="mini-label">Themes</div><div class="interest-chips">${topics.map(t=>`<button class="interest-chip ${state.interests.topics.includes(t)?"active":""}" onclick="toggleInterest('topics','${t}')">${t}</button>`).join("")}</div></div>`);
}
function openReadingMenu(){
  const custom=Object.keys(state.langs).filter(k=>state.langs[k]&&state.langs[k]!=="en").length;
  sheet(`<div class="sheet-head"><h2>Reading</h2><button class="close" onclick="closeSheet()">×</button></div>
    <div class="compact-setting"><span>Text size</span><div class="segmented"><button class="${state.textSize==="small"?"active":""}" onclick="setTextSizeChoice('small')">A</button><button class="${state.textSize==="default"?"active":""}" onclick="setTextSizeChoice('default')">A</button><button class="${state.textSize==="large"?"active":""}" onclick="setTextSizeChoice('large')">A</button></div></div>
    <div class="compact-setting"><span>Audio speed</span><div class="segmented"><button class="${state.audioRate===.8?"active":""}" onclick="setAudioRateChoice(.8)">0.8×</button><button class="${state.audioRate===.95?"active":""}" onclick="setAudioRateChoice(.95)">1×</button><button class="${state.audioRate===1.1?"active":""}" onclick="setAudioRateChoice(1.1)">1.1×</button></div></div>
    <button class="choice compact-link" onclick="openLanguageOverview()"><div class="choice-main"><b>Languages</b><span>${custom?custom+" customized":"English by default"}</span></div><div class="check">›</div></button>`);
}
function openAboutMenu(){
  sheet(`<div class="sheet-head"><h2>About</h2><button class="close" onclick="closeSheet()">×</button></div>
    <a class="choice compact-link" href="/about"><div class="choice-main"><b>About Scroll My Faith</b></div><div class="check">›</div></a>
    <a class="choice compact-link" href="/sources"><div class="choice-main"><b>Sources & translations</b></div><div class="check">›</div></a>
    <a class="choice compact-link" href="/privacy"><div class="choice-main"><b>Privacy</b></div><div class="check">›</div></a>
    <button class="choice compact-link" onclick="openMoreMenu()"><div class="choice-main"><b>More</b></div><div class="check">›</div></button>`);
}
function openMoreMenu(){
  sheet(`<div class="sheet-head"><h2>More</h2><button class="close" onclick="closeSheet()">×</button></div>
    <a class="choice compact-link" href="/scriptures"><div class="choice-main"><b>Browse scriptures</b></div><div class="check">›</div></a>
    <a class="choice compact-link" href="/topics"><div class="choice-main"><b>Browse themes</b></div><div class="check">›</div></a>
    <a class="choice compact-link" href="/guides"><div class="choice-main"><b>Guides</b></div><div class="check">›</div></a>\n    <a class="choice compact-link" href="/articles"><div class="choice-main"><b>Articles</b></div><div class="check">›</div></a>\n    <a class="choice compact-link" href="/editorial-policy"><div class="choice-main"><b>Editorial policy</b></div><div class="check">›</div></a>
    <button class="choice compact-link" onclick="openDataMenu()"><div class="choice-main"><b>Data & reset</b></div><div class="check">›</div></button>`);
}
function openDataMenu(){
  sheet(`<div class="sheet-head"><h2>Data & reset</h2><button class="close" onclick="closeSheet()">×</button></div>
    <button class="choice compact-link" onclick="resetPreferences();closeSheet()"><div class="choice-main"><b>Reset preferences</b></div></button>
    <button class="choice compact-link danger-link" onclick="clearSaved();closeSheet()"><div class="choice-main"><b>Clear saved passages</b></div></button>`);
}
function setTextSizeChoice(value){
  state.textSize=value;
  localStorage.setItem("ws-text-size",state.textSize);
  applyTextSize();
  renderYou();
  openReadingMenu();
}
function setAudioRateChoice(value){
  state.audioRate=Number(value);
  localStorage.setItem("ws-audio-rate",String(state.audioRate));
  renderYou();
  openReadingMenu();
}
function refreshPersonalizedFeed(){
  const keep=Number(state.activeId)||null;
  renderBatch(true,FEED_BATCH_SIZE,keep);
  feed.scrollTop=0;
  updateHeader();
}
function toggleInterest(type,value){
  const a=state.interests[type],i=a.indexOf(value);
  if(i>=0)a.splice(i,1);else a.push(value);
  localStorage.setItem("ws-interests",JSON.stringify(state.interests));
  refreshPersonalizedFeed();
  renderYou();
  openPersonalizeMenu();
}
function applyTextSize(){document.body.classList.remove("text-size-small","text-size-large");if(state.textSize==="small")document.body.classList.add("text-size-small");if(state.textSize==="large")document.body.classList.add("text-size-large")}
function openLanguageOverview(){sheet(`<div class="sheet-head"><h2>Scripture languages</h2><button class="close" onclick="closeSheet()">×</button></div>${traditions.map(t=>{const l=language(t.slug);return `<button class="choice" onclick="openLanguageFor('${t.slug}')"><div class="choice-icon">${t.symbol}</div><div class="choice-main"><b>${t.name}</b><span>${l.label}</span></div><div class="check">›</div></button>`}).join("")}`)}
function openLanguageFor(slug){const t=tradition(slug),cur=language(slug);sheet(`<div class="sheet-head"><h2>${t.name} language</h2><button class="close" onclick="closeSheet()">×</button></div>${t.languages.map(l=>`<button class="choice" onclick="setLanguageFromYou('${slug}','${l.key}')"><div class="choice-main"><b>${l.label}</b><span>${l.source}</span></div><div class="check">${cur.key===l.key?"●":"○"}</div></button>`).join("")}`)}
function setLanguageFromYou(slug,key){
  state.langs[slug]=key;
  localStorage.setItem("ws-langs",JSON.stringify(state.langs));
  closeSheet();
  refreshPersonalizedFeed();
  renderYou();
  toast("Language updated");
}
function resetPreferences(){
  state.interests={traditions:[],topics:[]};
  state.textSize="default";
  state.audioRate=.95;
  state.langs={};
  localStorage.removeItem("ws-interests");
  localStorage.removeItem("ws-text-size");
  localStorage.removeItem("ws-audio-rate");
  localStorage.removeItem("ws-langs");
  applyTextSize();
  refreshPersonalizedFeed();
  renderYou();
  toast("Preferences reset");
}
function clearSaved(){state.saved=[];localStorage.setItem("ws-saved","[]");renderYou();document.querySelectorAll("[data-save-id]").forEach(btn=>btn.childNodes[0].nodeValue="♡");toast("Saved passages cleared")}
function markCurrent(){const center=feed.getBoundingClientRect().top+feed.clientHeight/2;let best=null,d=Infinity;document.querySelectorAll(".slide").forEach(s=>{const r=s.getBoundingClientRect(),dist=Math.abs((r.top+r.height/2)-center);if(dist<d){d=dist;best=s}});document.querySelectorAll(".slide").forEach(s=>s.classList.toggle("current",s===best));if(best){state.activeId=Number(best.dataset.id);updateHeader()}}
$("#filterBtn").onclick=openFilter;$("#langBtn").onclick=openLanguage;
function toast(msg){const e=document.createElement("div");e.className="toast";e.textContent=msg;document.body.appendChild(e);setTimeout(()=>e.remove(),1300)}

function initFirstVisitCoach(){
  const key="ws-first-visit-coach-v1";
  try{
    if(localStorage.getItem(key))return;
    localStorage.setItem(key,"1");
  }catch{}
  const filterBtn=$("#filterBtn");
  if(!filterBtn||!feed)return;

  const coach=document.createElement("div");
  coach.className="first-run-coach";
  coach.setAttribute("aria-hidden","true");
  coach.innerHTML=`
    <div class="coach-filter-tip">
      <span>Filter traditions</span>
      <i>↗</i>
    </div>
    <div class="coach-scroll-tip">
      <span class="coach-minimal-arrow"></span>
      <strong>Swipe up</strong>
    </div>`;
  document.querySelector(".app")?.appendChild(coach);
  filterBtn.classList.add("coach-filter-pulse");

  requestAnimationFrame(()=>coach.classList.add("show"));

  let closed=false;
  const dismiss=()=>{
    if(closed)return;
    closed=true;
    coach.classList.remove("show");
    filterBtn.classList.remove("coach-filter-pulse");
    setTimeout(()=>coach.remove(),320);
  };
  const onScroll=()=>{if(feed.scrollTop>18){dismiss();feed.removeEventListener("scroll",onScroll)}};
  feed.addEventListener("scroll",onScroll,{passive:true});
  filterBtn.addEventListener("click",dismiss,{once:true});
  document.querySelector('[data-view="you"]')?.addEventListener("click",dismiss,{once:true});
  setTimeout(dismiss,8500);
}
function syncSeed(){
  document.querySelectorAll("[data-save-id]").forEach(btn=>{const id=Number(btn.dataset.saveId);btn.childNodes[0].nodeValue=state.saved.includes(id)?"♥":"♡"});
  const slides=$(".slide");
  if(slides.length){
    slides.forEach(s=>markSeen(Number(s.dataset.id)));
    state.lastRenderedId=Number(slides[slides.length-1].dataset.id);
    state.activeId=Number(slides[0].dataset.id);
  }
}
applyTextSize();renderYou();
const hasCustomFeed=state.filter!=="all"||state.topic||state.interests.traditions.length||state.interests.topics.length||Object.keys(state.langs).some(k=>state.langs[k]!=="en");
if(state.hadSeenHistory||hasCustomFeed){
  renderBatch(true,FEED_BATCH_SIZE);
  updateHeader();
}else{
  syncSeed();
  updateHeader();
  ensureRunway();
}
const deep=passageParam;if(deep&&passages.some(p=>p.id===Number(deep)))setTimeout(()=>jumpTo(Number(deep)),50);else setTimeout(initFirstVisitCoach,550);