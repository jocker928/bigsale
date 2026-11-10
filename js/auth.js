document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);
  const msg = $("message");

  if (!window.sb) {
    if (msg) msg.textContent = "Check Supabase configuration.";
    return;
  }

  const say = t => {
    if (msg) msg.textContent = t;
  };

  const login = $("loginForm");
  const signup = $("signupForm");
  const admin = $("adminLoginForm");

  if (login) login.addEventListener("submit", async e => {
    e.preventDefault();
    say("Signing in…");

    const { error } = await sb.auth.signInWithPassword({
      email: $("email").value,
      password: $("password").value
    });

    if (error) say(error.message);
    else location.href = "index.html";
  });

  if (signup) signup.addEventListener("submit", async e => {
    e.preventDefault();
    say("Creating account…");

    const { data, error } = await sb.auth.signUp({
      email: $("email").value,
      password: $("password").value,
      options: {
        data: { full_name: $("name").value },
        emailRedirectTo: "https://jocker928.github.io/bigsale/login.html"
      }
    });

    if (error) say(error.message);
    else say(data.session ? "Account created." : "Check your email.");
  });

  if (admin) admin.addEventListener("submit", async e => {
    e.preventDefault();
    say("Checking admin access…");

    const { error } = await sb.auth.signInWithPassword({
      email: $("email").value,
      password: $("password").value
    });

    if (error) {
      say(error.message);
      return;
    }

    const { data: { user } } = await sb.auth.getUser();
    const { data: profile } = await sb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["super_admin", "staff"].includes(profile.role)) {
      await sb.auth.signOut();
      say("This account does not have admin access.");
    } else {
      location.href = "admin.html";
    }
  });

  const google = $("googleBtn");

  if (google) google.addEventListener("click", async () => {
    say("Opening Google login…");

    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://jocker928.github.io/bigsale/index.html"
      }
    });

    if (error) say(error.message);
  });
});
