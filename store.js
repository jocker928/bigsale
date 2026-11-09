document.addEventListener("DOMContentLoaded",async()=>{
 document.getElementById("year").textContent=new Date().getFullYear();
 if(!window.sb){document.getElementById("productGrid").innerHTML='<p class="empty">Connect Supabase in js/config.js to load products.</p>';return;}
 const {data:{user}}=await sb.auth.getUser();if(user)document.getElementById("accountLink").textContent="My account";
 const grid=document.getElementById("productGrid"),search=document.getElementById("search");
 let products=[];
 async function load(){const {data,error}=await sb.from("products").select("*").eq("active",true).order("created_at",{ascending:false});if(error){grid.innerHTML='<p class="empty">Could not load products. Check Supabase setup.</p>';return;}products=data||[];render();}
 function render(){const q=search.value.toLowerCase();const shown=products.filter(p=>(p.name+" "+(p.description||"")+" "+(p.category||"")).toLowerCase().includes(q));grid.innerHTML=shown.length?shown.map(p=>`<article class="card">${p.image_url?`<img src="${esc(p.image_url)}" alt="${esc(p.name)}">`:'<div class="empty">No photo</div>'}<div class="card-info"><h3>${esc(p.name)}</h3><p class="muted">${esc(p.category||"")}</p><span class="price">₹${Number(p.offer_price??p.price).toFixed(2)}</span>${p.offer_price?`<span class="old-price">₹${Number(p.price).toFixed(2)}</span>`:""}<p class="muted">Stock: ${p.stock}</p></div></article>`).join(""):'<p class="empty">No products found yet. Check back soon.</p>';}
 search.addEventListener("input",render);await load();
});
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}