document.addEventListener("DOMContentLoaded", async () => {

  const { data: { session } } = await sb.auth.getSession();

  // Jika sudah login dan buka login page → redirect
  if (session && window.location.pathname.includes("login")) {
    window.location.href = "dashboard.html";
  }

  const form = document.getElementById("loginForm");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const { error } = await sb.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
  console.error(error);
  alert(error.message);
  return;
} else {
        window.location.href = "dashboard.html";
      }
    });
  }

});

async function checkAuth() {

  const { data: { session } } = await sb.auth.getSession();

  if (!session) {
    window.location.href = "login.html";
    return null;
  }

  // Ambil data user dari tabel users
  const { data: userData } = await sb
    .from("users")
    .select("*")
    .eq("email", session.user.email)
    .single();

  if (!userData || !userData.is_active) {
    alert("Akun tidak aktif. Hubungi admin.");
    await sb.auth.signOut();
    window.location.href = "login.html";
    return null;
  }

  return userData;
}

async function logout() {
  await sb.auth.signOut();
  window.location.href = "login.html";
}
