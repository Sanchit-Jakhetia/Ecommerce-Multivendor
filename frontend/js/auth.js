// SIGNUP
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if email already exists
    if (users.some(u => u.email === email)) {
      alert("Email already registered!");
      return;
    }

    users.push({ name, email, password, role: "buyer" });
    localStorage.setItem("users", JSON.stringify(users));
    alert("Account created successfully!");
    window.location.href = "login.html";
  });
}

// LOGIN
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      alert("Invalid email or password!");
      return;
    }

    // Save logged-in user
    localStorage.setItem("currentUser", JSON.stringify(user));
    alert(`Welcome back, ${user.name}!`);
    window.location.href = "index.html"; // redirect to homepage
  });
}

// Redirect user if not logged in
function authGuard(redirectToLogin = true) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user && redirectToLogin) {
    alert("You must be logged in to access this page.");
    window.location.href = "login.html";
    return false;
  }
  return true;
}
// LOGOUT
function updateHeader() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const userInfo = document.getElementById("user-info");
  const logoutBtn = document.getElementById("logout-btn");
  const loginLink = document.getElementById("login-link");
  const signupLink = document.getElementById("signup-link");

  if (!userInfo || !logoutBtn) return;

  if (user) {
    userInfo.textContent = `Hello, ${user.name}`;
    userInfo.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");

    if (loginLink) loginLink.classList.add("hidden");
    if (signupLink) signupLink.classList.add("hidden");
  } else {
    userInfo.classList.add("hidden");
    logoutBtn.classList.add("hidden");

    if (loginLink) loginLink.classList.remove("hidden");
    if (signupLink) signupLink.classList.remove("hidden");
  }
}

// ✅ Attach logout click event dynamically
document.addEventListener("click", e => {
  if (e.target && e.target.id === "logout-btn") {
    localStorage.removeItem("currentUser");
    updateHeader();
    window.location.reload();
  }
});


const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    alert("Logged out successfully!");
    updateHeader();
    window.location.href = "index.html";
  });
}

// Call updateHeader on page load
document.addEventListener("DOMContentLoaded", updateHeader);