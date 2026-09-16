const SUPABASE_URL = "https://gcdrkdlqryvjcagutyjc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_hOx4zpm2HzEO8m4wnUiDRA_RyQ-aQEM";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

let photos = [];

async function loadPhotos() {
  const { data, error } = await supabaseClient
    .from("photos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading photos:", error);
    return;
  }

 photos = await Promise.all((data || []).map(async p => {
  const { data: signedData, error: signedError } = await supabaseClient.storage
  .from("photos")
  .createSignedUrl(p.file_path, 3600);

if (signedError) {
  console.error("Signed URL error:", signedError);
}

  return {
    id: p.id,
    name: p.athlete_name || "Unknown athlete",
    team: p.team_name || "N/A",
    number: p.jersey_number ? `#${p.jersey_number}` : "N/A",
    sport: "sports",
    bg: signedData?.signedUrl
      ? `url("${signedData.signedUrl}") center/cover no-repeat`
      : "linear-gradient(135deg,#222,#777)"
  };
}));
  
  render();
}

let active="all", selected=null;
const grid=document.querySelector("#grid"), search=document.querySelector("#search");
function render(){
 const q=search.value.toLowerCase();
 const list = photos.filter(p =>
  (active === "all" || p.sport === active) &&
  [p.name, p.team, p.number].join(" ").toLowerCase().includes(q)
);
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
loadPhotos();renderPurchased();
