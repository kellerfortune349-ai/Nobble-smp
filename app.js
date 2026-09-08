const CATS = [
  ["overall","Overall"],["sword","Sword"],["axe","Axe"],["mace","Mace"],
  ["uhc","UHC"],["pot","Pot"],["nethop","NethOP"],["smp","SMP"],["vanilla","Vanilla"]
];
const ICONS = {overall:"assets/overall.png",sword:"assets/sword.png",axe:"assets/axe.png",mace:"assets/mace.png",uhc:"assets/uhc.png",pot:"assets/pot.png",nethop:"assets/nethop.png",smp:"assets/smp.png",vanilla:"assets/vanilla.png"};
const storeKey = "smp-tier-data-v1";
let players = JSON.parse(localStorage.getItem(storeKey) || "[]");
let currentCat = "overall";

const $ = id => document.getElementById(id);
const saveStore = () => localStorage.setItem(storeKey, JSON.stringify(players));

function points(tier){
  if(!tier) return 0;
  const m=tier.match(/([HL])T([1-5])/); if(!m) return 0;
  const high=m[1]==="H", n=+m[2];
  return Math.max(1, 11-(n*2)-(high?0:1));
}
function overall(p){
  const vals=Object.values(p.tiers).filter(Boolean).map(points);
  return vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length*10)/10 : 0;
}
function rankClass(r){return r<=3?"top":""}

function render(){
  const q=$("search").value.trim().toLowerCase();
  const title=CATS.find(x=>x[0]===currentCat)?.[1] || "Overall";
  $("page-title").textContent = title+" Rankings";
  let list=[...players];
  if(q) list=list.filter(p=>p.name.toLowerCase().includes(q));
  list.sort((a,b)=>{
    const av=currentCat==="overall"?overall(a):points(a.tiers[currentCat]);
    const bv=currentCat==="overall"?overall(b):points(b.tiers[currentCat]);
    return bv-av || a.name.localeCompare(b.name);
  });
  const html=list.map((p,i)=>{
    const vals=CATS.slice(1).map(([key])=>({key,tier:p.tiers[key]}));
    const shown=currentCat==="overall"?vals:vals.filter(x=>x.key===currentCat);
    return `<article class="player">
      <div class="rank ${rankClass(i+1)}">${i+1}.</div>
      <div class="person">
        <img class="skin" src="${escapeAttr(p.skin||"https://mc-heads.net/avatar/"+encodeURIComponent(p.name)+"/64")}" onerror="this.src='https://mc-heads.net/avatar/MHF_Steve/64'" alt="">
        <div><div class="pname">${escapeHtml(p.name)}</div><div class="class">${p.title||"Tier Tested"}${currentCat==="overall"&&overall(p)?` · ${overall(p)} pts`:``}</div></div>
      </div>
      <div><span class="region ${p.region}">${p.region}</span></div>
      <div class="tiers">${shown.map(x=>x.tier?`<div class="tier"><div class="tier-icon">${ICONS[x.key]}</div><div class="tier-label ${x.tier.replace(" ","")}">${x.tier}</div></div>`:`<div class="tier"><div class="tier-icon">—</div><div class="tier-label dash">—</div></div>`).join("")}</div>
    </article>`;
  }).join("");
  $("players").innerHTML=html;
  $("empty").classList.toggle("show",list.length===0);
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function escapeAttr(s){return escapeHtml(s).replace(/`/g,"&#096;");}

function buildTierForm(){
  $("tier-form").innerHTML=CATS.slice(1).map(([key,label])=>`
    <div class="tier-field"><label><img class="form-icon" src="${ICONS[key]}" alt=""> ${label}
      <select data-tier="${key}">
        <option value="">Not tested</option>
        ${["HT1","LT1","HT2","LT2","HT3","LT3","HT4","LT4","HT5","LT5"].map(t=>`<option>${t}</option>`).join("")}
      </select>
    </label></div>`).join("");
}
function openModal(edit=null){
  $("modal").classList.add("open");
  $("p-name").value=edit?.name||"";
  $("p-region").value=edit?.region||"NA";
  $("p-skin").value=edit?.skin||"";
  document.querySelectorAll("[data-tier]").forEach(s=>s.value=edit?.tiers?.[s.dataset.tier]||"");
}
function closeModal(){$("modal").classList.remove("open")}
function savePlayer(){
  const name=$("p-name").value.trim();
  if(!name){$("p-name").focus();return}
  const tiers={}; document.querySelectorAll("[data-tier]").forEach(s=>tiers[s.dataset.tier]=s.value);
  const obj={name,region:$("p-region").value,skin:$("p-skin").value.trim(),tiers,title:"Combat Ace"};
  const i=players.findIndex(p=>p.name.toLowerCase()===name.toLowerCase());
  if(i>=0) players[i]={...players[i],...obj}; else players.push(obj);
  saveStore(); closeModal(); render();
}
document.querySelectorAll(".cat").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll(".cat").forEach(x=>x.classList.remove("active"));b.classList.add("active");currentCat=b.dataset.cat;render();
}));
$("search").addEventListener("input",render);
document.addEventListener("keydown",e=>{if(e.key==="/" && document.activeElement!==$("search")){$("search").focus();e.preventDefault()}});
$("admin-open").onclick=()=>openModal();$("empty-admin").onclick=()=>openModal();$("close").onclick=closeModal;$("cancel").onclick=closeModal;$("save").onclick=savePlayer;
$("modal").addEventListener("click",e=>{if(e.target===$("modal"))closeModal()});
$("copy-ip").onclick=async()=>{await navigator.clipboard?.writeText($("server-ip").textContent);$("copy-ip").textContent="✓";setTimeout(()=>$("copy-ip").textContent="▣",900)};
$("year").textContent=new Date().getFullYear();buildTierForm();render();
