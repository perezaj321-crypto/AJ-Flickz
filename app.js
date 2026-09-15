const photos=[
 {id:"p01",name:"AJ Perez",team:"Dolphins",sport:"soccer",number:"#10",bg:"linear-gradient(135deg,#111 0 35%,#777 36% 55%,#222 56%)"},
 {id:"p02",name:"Marcus Lee",team:"Dolphins",sport:"basketball",number:"#3",bg:"linear-gradient(135deg,#333,#999 45%,#171717 46%)"},
 {id:"p03",name:"Jay Rodriguez",team:"Dolphins",sport:"baseball",number:"#7",bg:"linear-gradient(120deg,#777,#222 48%,#aaa 49%)"},
 {id:"p04",name:"Gavin G.",team:"Dolphins",sport:"soccer",number:"#21",bg:"linear-gradient(135deg,#222,#aaa 50%,#444 51%)"},
 {id:"p05",name:"Mia Carter",team:"Dolphins",sport:"basketball",number:"#14",bg:"linear-gradient(135deg,#888,#202020 55%,#aaa 56%)"},
 {id:"p06",name:"Noah Kim",team:"Dolphins",sport:"baseball",number:"#12",bg:"linear-gradient(135deg,#151515,#999 45%,#333 46%)"},
 {id:"p07",name:"Sofia Cruz",team:"Dolphins",sport:"soccer",number:"#9",bg:"linear-gradient(135deg,#aaa,#222 48%,#777 49%)"},
 {id:"p08",name:"Eli Brooks",team:"Dolphins",sport:"basketball",number:"#5",bg:"linear-gradient(135deg,#222,#777 48%,#111 49%)"}
];
let active="all", selected=null;
const grid=document.querySelector("#grid"), search=document.querySelector("#search");
function render(){
 const q=search.value.toLowerCase();
 const list=photos.filter(p=>(active==="all"||p.sport===active)&&[p.name,p.team,p.number,p.sport].join(" ").toLowerCase().includes(q));
 grid.innerHTML=list.map(p=>`<article class="tile" onclick="openPhoto('${p.id}')"><div class="photo" style="background:${p.bg}"><span class="watermark">FRAMEPLAY</span></div><div class="tile-info"><b>${p.name}</b><span>${p.team} • ${p.sport} • ${p.number}</span></div></article>`).join("");
}
document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");active=b.dataset.filter;render()});
search.oninput=render;
window.openPhoto=id=>{
 selected=photos.find(p=>p.id===id);
 document.querySelector("#modalPhoto").style.background=selected.bg;
 document.querySelector("#modalTitle").textContent=selected.name;
 document.querySelector("#modalMeta").textContent=`${selected.team} • ${selected.sport} • ${selected.number}`;
 document.querySelector("#modal").classList.remove("hidden");
};
document.querySelector("#close").onclick=()=>document.querySelector("#modal").classList.add("hidden");
document.querySelector("#buy").onclick=async()=>{
 if(!selected)return;
 const btn=document.querySelector("#buy"); btn.disabled=true; btn.textContent="Opening secure checkout...";
 try{
   const r=await fetch("/api/create-checkout-session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({photoId:selected.id,name:selected.name,priceCents:500})});
   const data=await r.json();
   if(!r.ok) throw new Error(data.error||"Stripe isn't configured yet");
   location.href=data.url;
 }catch(e){
   alert("Stripe is not connected yet. Add your Stripe test key to .env, then restart the server.");
   btn.disabled=false; btn.textContent="Buy this photo • $5";
 }
};
function renderPurchased(){
 const ids=JSON.parse(localStorage.getItem("purchased")||"[]");
 document.querySelector("#count").textContent=`${ids.length} photo${ids.length===1?"":"s"}`;
 const el=document.querySelector("#purchased");
 if(!ids.length){el.className="purchased empty";el.textContent="No purchases yet. Find a photo above to get started.";return}
 el.className="purchased-grid";
 el.innerHTML=ids.map(id=>{const p=photos.find(x=>x.id===id);return `<div class="purchase-item"><div class="photo" style="background:${p.bg}"></div><b>${p.name}</b><a class="download" href="#" onclick="alert('Production version: this button will generate a secure full-resolution download link.')">Download full resolution</a></div>`}).join("");
}
render();renderPurchased();