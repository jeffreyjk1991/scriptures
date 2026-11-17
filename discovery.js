(function(){
  const data=window.WS_DATA;
  if(!data)return;
  const traditions=data.traditions||[],passages=data.passages||[];
  const prefs=JSON.parse(localStorage.getItem("ws-langs")||"{}");
  const compareTopics=["peace","purpose","love","trust","discipline","compassion"];
  const labels={peace:"Peace",purpose:"Purpose",love:"Love",trust:"Hope & trust",discipline:"Discipline",compassion:"Compassion"};
  const exactPages={7:"/verse/bhagavad-gita-2-47",10:"/verse/dhammapada-1",11:"/verse/dhammapada-5",16:"/verse/mool-mantar"};
  const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  const norm=s=>String(s||"").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\u0590-\u05ff\u0600-\u06ff\u0900-\u097f\u0a00-\u0a7f\u3400-\u9fff]+/g," ").trim();
  function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
  function tr(slug){return traditions.find(t=>t.slug===slug)}
  function langFor(p){
    const t=tr(p.tradition),key=prefs[p.tradition]||"en";
    return (t&&t.languages.find(l=>l.key===key)&&p.text&&p.text[key])?t.languages.find(l=>l.key===key):(t&&t.languages.find(l=>l.key==="en"))||{key:"en",label:"English",source:""};
  }
  function textFor(p){const l=langFor(p);return (p.text&&p.text[l.key])||(p.text&&p.text.en)||""}
  function sourceFor(p){const l=langFor(p);return l.key==="en"&&p.source?p.source:l.source||""}
  function passageHref(p){return exactPages[p.id]||("/?passage="+p.id)}
  function candidates(slug,topic){
    return passages.filter(p=>p.tradition===slug&&p.topics&&p.topics.includes(topic)&&p.text&&p.text.en&&p.text.en.length<=190);
  }
  function pick(slug,topic,key){
    const list=candidates(slug,topic);
    return list.length?list[hash(key+"|"+slug+"|"+topic)%list.length]:null;
  }
  function passageCard(p){
    if(!p)return "";
    const t=tr(p.tradition)||{name:p.tradition,faith:"",symbol:"•"},lang=langFor(p);
    return '<article class="feature-passage"><div class="feature-passage-head"><span class="feature-symbol">'+esc(t.symbol)+'</span><div><strong>'+esc(t.name)+'</strong><small>'+esc(t.faith)+'</small></div></div><blockquote>'+esc(textFor(p))+'</blockquote><div class="feature-citation">'+esc(p.citation)+'</div><p>'+esc(p.context||"")+'</p><div class="feature-source">'+esc(lang.label)+(sourceFor(p)?" · "+esc(sourceFor(p)):"")+'</div><a class="feature-text-link" href="'+passageHref(p)+'">Open passage →</a></article>';
  }
  function sharePage(title,text){
    const payload={title:title,text:text,url:location.href};
    if(navigator.share){navigator.share(payload).catch(()=>{})}
    else if(navigator.clipboard){navigator.clipboard.writeText(text+"\n"+location.href).then(()=>flash("Link copied")).catch(()=>{})}
  }
  function flash(msg){
    const e=document.createElement("div");e.className="feature-toast";e.textContent=msg;document.body.appendChild(e);setTimeout(()=>e.remove(),1400);
  }
  function initCompare(){
    const bodyTopic=document.body.dataset.topic;
    const path=(location.pathname.match(/^\/compare\/([^/]+)\/?$/)||[])[1];
    const topic=compareTopics.includes(bodyTopic)?bodyTopic:(compareTopics.includes(path)?path:"peace");
    const topicNav=document.getElementById("compareTopics");
    if(topicNav)topicNav.innerHTML=compareTopics.map(x=>'<a class="feature-chip'+(x===topic?" active":"")+'" href="/compare/'+x+'">'+esc(labels[x])+'</a>').join("");
    const chosen=traditions.map(t=>pick(t.slug,topic,"compare")).filter(Boolean);
    const grid=document.getElementById("compareGrid");
    if(grid)grid.innerHTML=chosen.map(passageCard).join("");
    const summary=document.getElementById("compareSummary");
    if(summary)summary.textContent="One short passage from each tradition on "+labels[topic].toLowerCase()+".";
    const continueLink=document.getElementById("compareContinue");
    if(continueLink)continueLink.href="/?topic="+encodeURIComponent(topic);
    const share=document.getElementById("compareShare");
    if(share)share.onclick=()=>sharePage(labels[topic]+" across faiths","Compare passages on "+labels[topic].toLowerCase()+" across seven faith traditions.");
  }
  function dateKey(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
  function initDaily(){
    const q=new URLSearchParams(location.search),raw=q.get("date");
    let date=/^\d{4}-\d{2}-\d{2}$/.test(raw||"")?new Date(raw+"T12:00:00"):new Date();
    if(Number.isNaN(date.getTime()))date=new Date();
    const key=dateKey(date),today=dateKey(new Date());
    const topic=compareTopics[hash(key)%compareTopics.length];
    const chosen=traditions.map(t=>pick(t.slug,topic,key)).filter(Boolean);
    const dateEl=document.getElementById("dailyDate"),themeEl=document.getElementById("dailyTheme");
    if(dateEl)dateEl.textContent=new Intl.DateTimeFormat(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"}).format(date);
    if(themeEl)themeEl.textContent=labels[topic];
    const grid=document.getElementById("dailyGrid");if(grid)grid.innerHTML=chosen.map(passageCard).join("");
    const prev=new Date(date);prev.setDate(prev.getDate()-1);
    const next=new Date(date);next.setDate(next.getDate()+1);
    const prevEl=document.getElementById("dailyPrev"),nextEl=document.getElementById("dailyNext");
    if(prevEl)prevEl.href="/daily?date="+dateKey(prev);
    if(nextEl){nextEl.href="/daily?date="+dateKey(next);nextEl.hidden=dateKey(next)>today}
    const continueLink=document.getElementById("dailyContinue");if(continueLink)continueLink.href="/?topic="+encodeURIComponent(topic);
    const done=document.getElementById("dailyComplete");
    if(done){
      const storageKey="ws-daily-complete-"+key;
      const renderDone=()=>{const complete=localStorage.getItem(storageKey)==="1";done.textContent=complete?"✓ Reflection complete":"Mark today complete";done.classList.toggle("complete",complete)};
      done.hidden=key!==today;renderDone();
      done.onclick=()=>{localStorage.setItem(storageKey,"1");renderDone();flash("Today’s reflection complete")};
    }
    const share=document.getElementById("dailyShare");if(share)share.onclick=()=>sharePage("Today’s 7 · Scroll My Faith","Today’s seven-faith reflection: "+labels[topic]+".");
  }
  const topicAliases={
    anxiety:["anxiety","anxious","stress","stressed","worry","worried","fear","afraid","panic","overwhelmed"],
    peace:["peace","calm","rest","quiet","anger","angry","hate","hatred","conflict"],
    grief:["grief","grieving","loss","lost someone","mourning","death","bereavement"],
    purpose:["purpose","guidance","direction","meaning","calling","decision","decide","path"],
    love:["love","relationship","relationships","marriage","family","friendship"],
    forgiveness:["forgive","forgiveness","mercy","letting go","resentment"],
    trust:["hope","strength","trust","faith","courage","healing","lonely","loneliness"],
    discipline:["discipline","patience","patient","action","work","motivation","focus","exam","study"],
    compassion:["compassion","kindness","kind","care","charity","help others"],
    justice:["justice","fairness","fair","rights","inequality"]
  };
  const traditionAliases={
    christianity:["bible","christian","christianity","jesus","psalm","proverbs"],
    islam:["quran","qur an","islam","muslim","allah","surah"],
    hinduism:["gita","bhagavad","hindu","hinduism","krishna"],
    buddhism:["buddha","buddhist","buddhism","dhammapada","pali"],
    judaism:["jewish","judaism","tanakh","torah","hebrew"],
    sikhism:["sikh","sikhism","guru granth","gurbani","mool mantar","japji"],
    taoism:["tao","dao","taoism","daoism","tao te ching","laozi"]
  };
  function intent(q){
    const n=norm(q),ts=new Set(),trs=new Set();
    Object.entries(topicAliases).forEach(([topic,words])=>{if(words.some(w=>n.includes(norm(w))))ts.add(topic)});
    Object.entries(traditionAliases).forEach(([slug,words])=>{if(words.some(w=>n.includes(norm(w))))trs.add(slug)});
    return {n,topics:[...ts],traditions:[...trs],tokens:n.split(/\s+/).filter(x=>x.length>2)};
  }
  function scorePassage(p,it){
    const t=tr(p.tradition)||{name:"",faith:""};
    const all=norm([p.citation,p.context,(p.topics||[]).join(" "),t.name,t.faith,Object.values(p.text||{}).join(" ")].join(" "));
    let s=0;
    if(it.n&&norm(p.citation).includes(it.n))s+=40;
    if(it.traditions.includes(p.tradition))s+=16;
    (p.topics||[]).forEach(tp=>{if(it.topics.includes(tp))s+=14});
    it.tokens.forEach(tok=>{if(norm(p.citation).includes(tok))s+=6;if(norm(p.context||"").includes(tok))s+=4;if(all.includes(tok))s+=2});
    return s;
  }
  function searchPassages(q){
    const it=intent(q);
    let scored=passages.map(p=>({p,score:scorePassage(p,it)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.p.id-b.p.id);
    if(!scored.length&&it.tokens.length)scored=passages.map(p=>({p,score:it.tokens.reduce((s,t)=>s+(norm((p.text&&p.text.en)||"").includes(t)?1:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
    if(!it.traditions.length){
      const counts={};scored=scored.filter(x=>{const n=counts[x.p.tradition]||0;if(n>=2)return false;counts[x.p.tradition]=n+1;return true});
    }
    return {it,results:scored.slice(0,14).map(x=>x.p)};
  }
  function initSearch(){
    const form=document.getElementById("searchForm"),input=document.getElementById("searchInput");
    const suggestions=["I’m anxious","I need hope","Bhagavad Gita 2:47","What does Buddhism say about anger?","Scriptures about grief","Sikh scripture about peace"];
    const sugg=document.getElementById("searchSuggestions");
    if(sugg)sugg.innerHTML=suggestions.map(s=>'<button type="button" class="feature-chip search-suggestion" data-query="'+esc(s)+'">'+esc(s)+'</button>').join("");
    document.querySelectorAll(".search-suggestion").forEach(b=>b.onclick=()=>{input.value=b.dataset.query;run(input.value,true)});
    function run(q,push){
      q=(q||"").trim();
      if(push){const u=new URL(location.href);if(q)u.searchParams.set("q",q);else u.searchParams.delete("q");history.pushState({},"",u)}
      const meta=document.getElementById("searchMeta"),results=document.getElementById("searchResults"),compare=document.getElementById("searchCompare");
      if(!q){if(meta)meta.textContent="Try a feeling, life situation, scripture reference or tradition.";if(results)results.innerHTML="";if(compare)compare.innerHTML="";return}
      const found=searchPassages(q);
      if(meta)meta.textContent=found.results.length?found.results.length+" relevant passages":"No close matches yet";
      if(results)results.innerHTML=found.results.length?found.results.map(passageCard).join(""):'<div class="feature-empty">Try a broader phrase such as “peace”, “grief”, “Bhagavad Gita”, or “Qur’an hope”.</div>';
      const comparable=found.it.topics.find(t=>compareTopics.includes(t));
      if(compare)compare.innerHTML=comparable?'<a class="feature-text-link feature-compare-link" href="/compare/'+comparable+'">Compare '+esc(labels[comparable]).toLowerCase()+' across seven faiths →</a>':"";
    }
    if(form)form.addEventListener("submit",ev=>{ev.preventDefault();run(input.value,true)});
    const initial=new URLSearchParams(location.search).get("q")||"";input.value=initial;run(initial,false);
    addEventListener("popstate",()=>{const q=new URLSearchParams(location.search).get("q")||"";input.value=q;run(q,false)});
  }
  const feature=document.body.dataset.feature;
  if(feature==="compare")initCompare();
  if(feature==="daily")initDaily();
  if(feature==="search")initSearch();
})();