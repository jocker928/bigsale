document.addEventListener("DOMContentLoaded",()=>{
 const $=id=>document.getElementById(id), msg=$("message");
 if(!window.sb){if(msg)msg.textContent="Add your Supabase URL and publishable key in js/config.js first.";return;}
 const say=t=>{if(msg)msg.textContent=t;};
 const login=$("loginForm"), signup=$("signupForm"), admin=$("adminLoginForm");
 if(login)login.addEventListener("submit",async e=>{e.preventDefault();say("Signing in…");const {error}=await sb.auth.signInWithPassword({email:$("email").value,password:$("password").value});if(error)say(error.message);else location.href="index.html";});
 if(signup)signup.addEventListener("submit",async e=>{e.preventDefault();say("Creating account…");const {data,error}=await sb.auth.signUp({email:$("email").value,password:$("password").value,options:{data:{full_name:$("name").value},emailRedirectTo:location.origin+"/login.html"}});if(error)say(error.message);else say(data.session?"Account created.":"Check your email to confirm your account.");});
 if(admin)admin.addEventListener("submit",async e=>{e.preventDefault();say("Checking admin access…");const {error}=await sb.auth.signInWithPassword({email:$("email").value,password:$("password").value});if(error){say(error.message);return;}const {data:profile,error:pe}=await sb.from("profiles").select("role").eq("id",(await sb.auth.getUser()).data.user.id).single();if(pe||!["super_admin","staff"].includes(profile.role)){await sb.auth.signOut();say("This account does not have admin access.");}else location.href="admin.html";});
 const google=$("googleBtn");if(google)google.addEventListener("click",async()=>{const {error}=await sb.auth.signInWithOAuth({provider:"google",options:{redirectTo:location.origin+"/index.html"}});if(error)say(error.message);});
});