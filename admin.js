document.addEventListener("DOMContentLoaded",async()=>{
 const $=id=>document.getElementById(id), say=t=>$("adminMessage").textContent=t;
 if(!window.sb){say("Add Supabase URL and publishable key in js/config.js.");return;}
 const {data:{user}}=await sb.auth.getUser();if(!user){location.href="admin-login.html";return;}
 const {data:profile,error}=await sb.from("profiles").select("role,full_name").eq("id",user.id).single();
 if(error||!profile||!["super_admin","staff"].includes(profile.role)){await sb.auth.signOut();location.href="admin-login.html";return;}
 $("adminIdentity").textContent=(profile.full_name||user.email)+" · "+profile.role.replace("_"," ");
 if(profile.role==="super_admin")$("staffPanel").classList.remove("hidden");
 $("logout").onclick=async()=>{await sb.auth.signOut();location.href="admin-login.html";};
 const form=$("productForm");
 function reset(){form.reset();$("productId").value="";$("formTitle").textContent="Add product";$("saveProduct").textContent="Save product";$("cancelEdit").classList.add("hidden");}
 $("cancelEdit").onclick=reset;$("refresh").onclick=load;
 form.addEventListener("submit",async e=>{e.preventDefault();say("Saving product…");let imageUrl=null;const file=$("photo").files[0];const id=$("productId").value;
 if(file){if(!file.type.startsWith("image/")){say("Choose an image file.");return;}if(file.size>5*1024*1024){say("Image must be under 5 MB.");return;}const path=`${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,"_")}`;const up=await sb.storage.from("product-images").upload(path,file,{upsert:false});if(up.error){say(up.error.message);return;}imageUrl=sb.storage.from("product-images").getPublicUrl(path).data.publicUrl;}
 const payload={name:$("productName").value.trim(),description:$("description").value.trim(),category:$("category").value.trim(),stock:Number($("stock").value),price:Number($("price").value),offer_price:$("offerPrice").value===""?null:Number($("offerPrice").value),sizes:$("sizes").value.split(",").map(x=>x.trim()).filter(Boolean),colours:$("colours").value.split(",").map(x=>x.trim()).filter(Boolean)};
 if(imageUrl)payload.image_url=imageUrl;
 let result=id?await sb.from("products").update(payload).eq("id",id):await sb.from("products").insert(payload);
 if(result.error){say(result.error.message);return;}say("Product saved successfully.");reset();load();
 });
 async function load(){const box=$("adminProducts");box.textContent="Loading…";const {data,error}=await sb.from("products").select("*").order("created_at",{ascending:false});if(error){box.textContent=error.message;return;}box.innerHTML=data.length?data.map(p=>`<div class="admin-row"><img src="${p.image_url||""}" alt=""><div><h3>${esc(p.name)}</h3><p>₹${Number(p.offer_price??p.price).toFixed(2)} · Stock ${p.stock} · ${esc(p.category||"")}</p></div><div class="row-actions"><button class="button secondary" data-edit="${p.id}">Edit</button><button class="button" data-delete="${p.id}">Delete</button></div></div>`).join(""):"No products yet. Add your first product.";
 box.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>{const p=data.find(x=>String(x.id)===b.dataset.edit);$("productId").value=p.id;$("productName").value=p.name;$("description").value=p.description||"";$("category").value=p.category||"";$("stock").value=p.stock;$("price").value=p.price;$("offerPrice").value=p.offer_price??"";$("sizes").value=(p.sizes||[]).join(", ");$("colours").value=(p.colours||[]).join(", ");$("formTitle").textContent="Edit product";$("saveProduct").textContent="Update product";$("cancelEdit").classList.remove("hidden");window.scrollTo({top:0,behavior:"smooth"});});
 box.querySelectorAll("[data-delete]").forEach(b=>b.onclick=async()=>{if(!confirm("Delete this product?"))return;const {error}=await sb.from("products").delete().eq("id",b.dataset.delete);if(error)alert(error.message);else load();});
 }
 $("staffForm").addEventListener("submit",async e=>{e.preventDefault();$("staffMessage").textContent="Updating role…";const email=$("staffEmail").value.trim();const {data:users,error}=await sb.rpc("promote_user_to_staff",{user_email:email});$("staffMessage").textContent=error?error.message:(users||"Staff role updated.");});
 await load();
});
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}