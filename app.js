(function(){
"use strict";
var TC={High:"#3f8a63",Medium:"#b8913a",Low:"#5d6782","Not useful":"#8a463f"},TIERS=["All","High","Medium","Low","Not useful"];
var BOTS=[],CATS=[],CATN={},AREAS=[],AN={},PROMPTS=[null,null];
var st={q:"",tier:"All",cat:"All",area:0,view:"all",limit:30,open:{},prompt:{},copied:""};
function load(k){try{var v=localStorage.getItem(k);return v?JSON.parse(v):[]}catch(e){return[]}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
var likes=load("bd-likes-v2"),hidden=load("bd-hidden");
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function tierOf(s){return s>=8?"High":s>=6?"Medium":s>=4?"Low":"Not useful"}
function $(id){return document.getElementById(id)}
function has(a,x){return a.indexOf(x)>=0}
function base(){var ql=st.q.toLowerCase();return BOTS.filter(function(b){
 if(st.view==="hidden"?!has(hidden,b.id):has(hidden,b.id))return false;
 if(st.view==="liked"&&!has(likes,b.id))return false;
 if(st.tier!=="All"&&tierOf(b.s)!==st.tier)return false;
 if(st.area&&b.a.indexOf(st.area)<0)return false;
 return !ql||b._q.indexOf(ql)>=0})}
function renderTop(){
 var cnt={All:BOTS.length};BOTS.forEach(function(b){var t=tierOf(b.s);cnt[t]=(cnt[t]||0)+1});
 $("tabs").innerHTML='<button class="chip'+(st.view==="all"?" on":"")+'" data-v="all">All bots · '+(BOTS.length-hidden.length)+'</button><button class="chip int'+(st.view==="liked"?" on":"")+'" data-v="liked">♥ Interested · '+likes.length+'</button><button class="chip'+(st.view==="hidden"?" on":"")+'" data-v="hidden">Hidden · '+hidden.length+'</button>';
 $("tiers").innerHTML=TIERS.map(function(k){return'<button class="chip'+(st.tier===k?" on":"")+'" data-t="'+esc(k)+'">'+esc(k)+" · "+cnt[k]+"</button>"}).join("");
 var p="";if(st.view==="liked"){p='<div class="box">'+(likes.length?likes.length+" bots marked Interested. Send them to dr eggbot as a numbered list with IDs and links.":"Tap ♥ on any bot to add it here.")+(likes.length?'<br><button class="send" id="send">Send my picks</button>':"")+(st.copied?'<div class="ok">'+esc(st.copied)+"</div>":"")+(st.copied.indexOf("blocked")>=0?"<pre>"+esc(pickText())+"</pre>":"")+"</div>"}
 $("picks").innerHTML=p;
}
function pickText(){var ps=BOTS.filter(function(b){return has(likes,b.id)});return"My picks from the bot ranking ("+ps.length+"):\n"+ps.map(function(b,i){return(i+1)+". ["+b.id+"] "+b.n+" - "+b.u}).join("\n")}
function card(b){
 var t=tierOf(b.s),lk=has(likes,b.id),hd=has(hidden,b.id),full=b.s>=6||st.open[b.id];
 var h='<div class="card'+(full?"":" c")+'" style="border-top-color:'+TC[t]+'"><div class="hd"><div class="idl">#'+b.r+" · ID "+esc(b.id)+'</div><div><button class="ib'+(lk?" lk":"")+'" data-like="'+b.id+'" aria-label="Interested">'+(lk?"♥":"♡")+'</button><button class="ib'+(hd?" hd2":"")+'" data-hide="'+b.id+'" aria-label="'+(hd?"Restore":"Hide")+'">'+(hd?"↺":"✕")+"</button></div></div>";
 h+='<div class="tt"><span class="sc">'+b.s+'</span><span class="nm">'+esc(b.n)+"</span></div>";
 h+='<div class="pills"><span class="pill" style="background:'+TC[t]+'">'+t+' fit</span><span class="pill cat" data-cat="'+b.c+'">◆ '+esc(CATN[b.c])+"</span>"+(b.c2?'<span class="pill c2" data-cat="'+b.c2+'">+ '+esc(CATN[b.c2])+"</span>":"")+(b.o?'<span class="pill" style="background:#1e2840">Overlaps a bot you have</span>':"")+(b.t?'<span class="pill ol">Generated template, not a real user bot</span>':"")+(b.x?'<span class="pill gl">Share-only, no public prompt</span>':"")+(b.id[0]==="X"?'<span class="pill ol">Found in X articles</span>':"")+"</div>";
 if(b.k)h+='<div class="caut">Caution: '+esc(b.k)+"</div>";
 if(full){
  if(b.d)h+='<div class="lab">WHAT IT DOES</div><div class="txt">'+esc(b.d)+"</div>";
  if(b.f&&b.f.length)h+='<div class="lab">FUNCTIONS</div><ul>'+b.f.map(function(x){return"<li>"+esc(x)+"</li>"}).join("")+"</ul>";
  h+='<div class="why"><div class="lab">WHY IT FITS YOU</div><div class="txt">'+esc(b.w)+"</div></div>";
  if(b.src)h+='<div class="src">'+esc(b.src)+"</div>";
 }else h+='<div class="txt" style="font-size:13.5px">'+esc(b.w)+"</div>";
 h+='<div class="lnk">'+(b.u?'<a href="'+esc(b.u)+'" target="_blank" rel="noopener noreferrer">'+(b.id[0]==="D"?"View listing":b.t?"Open template":"Open share link")+"</a>":"");
 if(!full)h+='<button data-open="'+b.id+'">More details</button>';
 if(b.p!==undefined)h+='<button data-prompt="'+b.id+'">'+(st.prompt[b.id]?"Hide prompt":"Show prompt")+"</button>";
 h+="</div>";
 if(st.prompt[b.id]){var P=PROMPTS[b.p];h+="<pre>"+(P?esc(P[b.id]||"Prompt not found."):"Loading prompt…")+"</pre>"}
 return h+"</div>";
}
function render(){
 renderTop();
 var bs=base(),cc={All:bs.length};bs.forEach(function(b){cc[b.c]=(cc[b.c]||0)+1;if(b.c2)cc[b.c2]=(cc[b.c2]||0)+1});
 var ac={};BOTS.forEach(function(b){if(st.view==="hidden"?has(hidden,b.id):!has(hidden,b.id))b.a.forEach(function(a){ac[a]=(ac[a]||0)+1})});
 $("areas").innerHTML=[[0,"All interests"]].concat(AREAS).map(function(a){var on=st.area===a[0];return'<button class="chip'+(on?" on":"")+'" data-a="'+a[0]+'">'+esc(a[1])+(a[0]?" · "+(ac[a[0]]||0):"")+"</button>"}).join("");
 $("cats").innerHTML=[["All","All categories"]].concat(CATS).map(function(c){var n=cc[c[0]]||0,on=st.cat===c[0];return'<button class="chip'+(on?" on":"")+(n||on?"":" z")+'" data-c="'+c[0]+'">'+esc(c[1])+" · "+n+"</button>"}).join("");
 var list=bs.filter(function(b){return st.cat==="All"||b.c===st.cat||b.c2===st.cat});
 $("meta").innerHTML=list.length+" bots match"+(st.cat!=="All"?" in "+esc(CATN[st.cat])+'<button data-c="All">Clear category</button>':"");
 $("list").innerHTML=list.slice(0,st.limit).map(card).join("");
 var m=$("more");if(list.length>st.limit){m.hidden=false;m.textContent="Show more ("+(list.length-st.limit)+" left)"}else m.hidden=true;
}
function loadPrompts(i){if(PROMPTS[i]||PROMPTS["l"+i])return;PROMPTS["l"+i]=1;fetch("prompts-"+i+".json").then(function(r){return r.json()}).then(function(j){PROMPTS[i]=j;render()}).catch(function(){PROMPTS["l"+i]=0})}
function copy(){var text=pickText();function done(){st.copied="Copied, paste it to dr eggbot";renderTop();setTimeout(function(){st.copied="";renderTop()},4000)}
 function fb(){try{var ta=document.createElement("textarea");ta.value=text;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.focus();ta.select();var ok=document.execCommand("copy");document.body.removeChild(ta);if(ok)done();else{st.copied="Copy was blocked. Long-press the list below to copy it.";renderTop()}}catch(e){st.copied="Copy was blocked. Long-press the list below to copy it.";renderTop()}}
 try{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(done,fb);else fb()}catch(e){fb()}}
function tog(arr,id){var i=arr.indexOf(id);if(i>=0)arr.splice(i,1);else arr.push(id)}
document.addEventListener("click",function(e){var el=e.target.closest("button,[data-cat],[data-ar]");if(!el)return;var d=el.dataset;
 if(d.v){st.view=d.v;st.limit=30;st.copied="";render()}
 else if(d.t){st.tier=d.t;st.limit=30;render()}
 else if(d.a!==undefined){st.area=+d.a;st.limit=30;render()}
 else if(d.c){st.cat=d.c;st.limit=30;render()}
 else if(d.ar){st.area=+d.ar;st.limit=30;render();window.scrollTo(0,$("areas").offsetTop-80)}
 else if(d.cat){st.cat=d.cat;st.limit=30;render();window.scrollTo(0,$("cats").offsetTop-80)}
 else if(d.like){tog(likes,d.like);save("bd-likes-v2",likes);render()}
 else if(d.hide){tog(hidden,d.hide);save("bd-hidden",hidden);render()}
 else if(d.open){st.open[d.open]=1;render()}
 else if(d.prompt){st.prompt[d.prompt]=!st.prompt[d.prompt];var b=BOTS.filter(function(x){return x.id===d.prompt})[0];if(b)loadPrompts(b.p);render()}
 else if(el.id==="send")copy();
 else if(el.id==="more"){st.limit+=40;render()}
 else if(el.id==="top")window.scrollTo(0,0);
});
var tmr;$("q").addEventListener("input",function(e){clearTimeout(tmr);var v=e.target.value;tmr=setTimeout(function(){st.q=v;st.limit=30;render()},120)});
fetch("data.json").then(function(r){return r.json()}).then(function(j){
 CATS=j.cats;AREAS=j.areas||[];AREAS.forEach(function(a){AN[a[0]]=a[1]});CATS.forEach(function(c){CATN[c[0]]=c[1]});
 BOTS=j.bots;BOTS.forEach(function(b,i){b.r=i+1;b._q=(b.n+" "+(b.a||[]).map(function(x){return AN[x]}).join(" ")+" "+b.w+" "+b.d+" "+b.id+" "+CATN[b.c]+" "+(CATN[b.c2]||"")).toLowerCase()});
 var ids={};BOTS.forEach(function(b){ids[b.id]=1});likes=likes.filter(function(x){return ids[x]});hidden=hidden.filter(function(x){return ids[x]});
 $("intro").textContent="All "+BOTS.length+" bots, each read and scored by hand against your eight equally weighted areas, from restaurants and real estate to app building, security and your phone. Sorted best first, Not useful at the bottom. Tap ♥ to mark a bot Interested and ✕ to hide it; both are saved on this phone.";
 render();
}).catch(function(){$("intro").textContent="Could not load the bot list. Check your connection and reopen."});
if("serviceWorker" in navigator)window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){})});
})();
