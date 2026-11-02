const {traditions,passages,topics}=window.WS_DATA;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const state={filter:"all",langs:JSON.parse(localStorage.getItem("ws-langs")||"{}"),saved:JSON.parse(localStorage.getItem("ws-saved")||"[]"),batch:0};
const tradition=s=>traditions.find(t=>t.slug===s);
const language=(slug)=>{const t=tradition(slug);const key=state.langs[slug]||"en";return t.languages.find(l=>l.key===key)||t.languages[0]};
const textFor=p=>p.text[language(p.tradition).key]||p.text.en;
function shuffled(list){const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function sourceList(){return state.filter==="all"?passages:passages.filter(p=>p.tradition===state.filter)}
function renderBatch(reset=false){if(reset){$("#feed").innerHTML="";state.batch=0}const list=shuffled(sourceList());const frag=document.createDocumentFragment();list.forEach((p,i)=>{const t=tradition(p.tradition),lang=language(p.tradition),slide=document.createElement("section");slide.className="slide";slide.dataset.id=p.id;slide.dataset.batch=state.batch;slide.innerHTML=`
<div class="passage-wrap" dir="${["ar","ur","he"].includes(lang.key)?"rtl":"ltr"}">
  <div class="eyebrow"><span class="symbol">${t.symbol}</span><span>${t.name} · ${t.faith}</span></div>
  <p class="passage">${textFor(p)}</p><p class="citation">${p.citation}</p><p class="source">${lang.label} · ${lang.source}</p>
</div>
<div class="actions">
<button class="action" data-save-id="${p.id}" onclick="toggleSave(${p.id})">${state.saved.includes(p.id)?"♥":"♡"}<small>Save</small></button>
<button class="action" onclick="openStudy(${p.id})">▣<small>Study</small></button>
<button class="action" onclick="sharePassage(${p.id})">↥<small>Share</small></button>
<button class="action" onclick="speakPassage(${p.id})">◖<small>Listen</small></button>
</div><div class="scroll-hint">scroll for more</div>`;frag.appendChild(slide)});$("#feed").appendChild(frag);state.batch++}
let loading=false;$("#feed").addEventListener("scroll",()=>{const f=$("#feed");if(!loading&&f.scrollTop+f.clientHeight>f.scrollHeight-f.clientHeight*2){loading=true;renderBatch(false);setTimeout(()=>loading=false,150)}});
function setView(id){$$(".view").forEach(v=>v.classList.toggle("active",v.id===id));$$(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===id));if(id==="saved")renderSaved();if(id==="search")runSearch($("#q").value||"")}
$$(".nav-btn").forEach(b=>b.onclick=()=>setView(b.dataset.view));
function sheet(content){$("#modal").innerHTML=`<div class="overlay" onclick="closeSheet()"><div class="sheet" onclick="event.stopPropagation()"><div class="grab"></div>${content}</div></div>`}
function closeSheet(){$("#modal").innerHTML=""}
function openFilter(){sheet(`<div class="sheet-head"><h2>Read</h2><button class="close" onclick="closeSheet()">×</button></div>${[{slug:"all",name:"All traditions",faith:"Mixed feed",symbol:"∞"},...traditions].map(t=>`<button class="choice" onclick="chooseFilter('${t.slug}')"><div class="choice-icon">${t.symbol}</div><div class="choice-main"><b>${t.name}</b><span>${t.faith}</span></div><div class="check">${state.filter===t.slug?"✓":""}</div></button>`).join("")}`)}
function chooseFilter(slug){state.filter=slug;closeSheet();updateHeader();renderBatch(true)}
function updateHeader(){const label=state.filter==="all"?"All":tradition(state.filter).name;$("#filterBtn").textContent=label;const first=sourceList()[0];$("#langBtn").textContent=first?language(first.tradition).short:"EN"}
function openLanguage(){const p=sourceList()[0];if(!p)return;const t=tradition(p.tradition),cur=language(p.tradition);sheet(`<div class="sheet-head"><h2>${t.name} language</h2><button class="close" onclick="closeSheet()">×</button></div>${t.languages.map(l=>`<button class="choice" onclick="setLanguage('${t.slug}','${l.key}')"><div class="choice-main"><b>${l.label}</b><span>${l.source}</span></div><div class="check">${cur.key===l.key?"●":"○"}</div></button>`).join("")}`)}
function setLanguage(slug,key){state.langs[slug]=key;localStorage.setItem("ws-langs",JSON.stringify(state.langs));closeSheet();updateHeader();renderBatch(true);renderSaved();toast("Language updated")}
function toggleSave(id){state.saved=state.saved.includes(id)?state.saved.filter(x=>x!==id):[...state.saved,id];localStorage.setItem("ws-saved",JSON.stringify(state.saved));renderBatch(true);renderSaved();toast(state.saved.includes(id)?"Saved":"Removed")}
function openStudy(id){const p=passages.find(x=>x.id===id),t=tradition(p.tradition),l=language(p.tradition);sheet(`<div class="study"><div class="sheet-head"><div><b>${p.citation}</b><div class="source">${t.faith} · ${l.label}</div></div><button class="close" onclick="closeSheet()">×</button></div><h3>Context</h3><p>${p.context}</p><div class="tag-row">${p.topics.map(x=>`<span>${x}</span>`).join("")}</div><p class="source" style="margin-top:18px">Text source: ${l.source}</p></div>`)}
function voiceFor(locale){const voices=speechSynthesis.getVoices();const base=locale.toLowerCase().split("-")[0];return voices.find(v=>v.lang.toLowerCase()===locale.toLowerCase())||voices.find(v=>v.lang.toLowerCase().startsWith(base))||null}
function speakPassage(id){const p=passages.find(x=>x.id===id),l=language(p.tradition);if(!("speechSynthesis" in window)){toast("Audio is not supported on this device");return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(textFor(p));u.lang=l.locale;const v=voiceFor(l.locale);if(v)u.voice=v;u.rate=.9;speechSynthesis.speak(u);toast("Playing in "+l.label)}
async function sharePassage(id){const p=passages.find(x=>x.id===id),v=textFor(p)+" — "+p.citation;try{if(navigator.share)await navigator.share({title:p.citation,text:v,url:location.origin+"/?passage="+id});else{await navigator.clipboard.writeText(v+"\n"+location.origin+"/?passage="+id);toast("Copied")}}catch{}}
function renderDiscover(){$("#discoverList").innerHTML=`<div class="row" onclick="chooseFromDiscover('all')"><div class="row-icon">∞</div><div class="row-copy"><b>All traditions</b><span>One continuous mixed feed</span></div>›</div>`+traditions.map(t=>`<div class="row" onclick="chooseFromDiscover('${t.slug}')"><div class="row-icon">${t.symbol}</div><div class="row-copy"><b>${t.name}</b><span>${t.faith}</span></div>›</div>`).join("")}
function chooseFromDiscover(slug){state.filter=slug;setView("home");updateHeader();renderBatch(true)}
function runSearch(q){q=(q||"").trim().toLowerCase();const found=passages.filter(p=>!q||p.citation.toLowerCase().includes(q)||p.topics.some(t=>t.includes(q))||Object.values(p.text).some(v=>v.toLowerCase().includes(q)));$("#searchResults").innerHTML=found.length?found.map(p=>{const t=tradition(p.tradition);return `<div class="row" onclick="jumpTo(${p.id})"><div class="row-icon">${t.symbol}</div><div class="row-copy"><b>${p.citation}</b><span>${textFor(p).slice(0,92)}${textFor(p).length>92?"…":""}</span></div>›</div>`}).join(""):`<div class="empty">No passages found.</div>`}
function jumpTo(id){state.filter="all";setView("home");updateHeader();renderBatch(true);setTimeout(()=>document.querySelector('[data-id="'+id+'"]')?.scrollIntoView({behavior:"smooth"}),50)}
function renderSaved(){const a=passages.filter(p=>state.saved.includes(p.id));$("#savedList").innerHTML=a.length?a.map(p=>{const t=tradition(p.tradition);return `<div class="row" onclick="jumpTo(${p.id})"><div class="row-icon">${t.symbol}</div><div class="row-copy"><b>${p.citation}</b><span>${textFor(p).slice(0,92)}${textFor(p).length>92?"…":""}</span></div>›</div>`}).join(""):`<div class="empty">Saved passages will appear here.</div>`}
function toast(msg){const e=document.createElement("div");e.className="toast";e.textContent=msg;document.body.appendChild(e);setTimeout(()=>e.remove(),1300)}
$("#filterBtn").onclick=openFilter;$("#langBtn").onclick=openLanguage;$("#q").oninput=e=>runSearch(e.target.value);
renderDiscover();renderSaved();runSearch("");updateHeader();renderBatch(true);
const deep=new URLSearchParams(location.search).get("passage");if(deep)setTimeout(()=>jumpTo(Number(deep)),80);