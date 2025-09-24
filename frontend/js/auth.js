// SIGNUP
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorDiv = document.getElementById("signup-error");
    if (errorDiv) {
      errorDiv.classList.add("hidden");
      errorDiv.textContent = "";
    }

    // Prepare user data to match DB structure
    const userData = {
      name,
      email,
      password,
      role: "buyer",
      addresses: [
        {
          label: "Other",
          line1: null,
          line2: null,
          city: null,
          state: null,
          postalCode: null,
          country: null
        }
      ],
      phoneNumbers: [
        {
          label: "Mobile",
          number: null
        }
      ]
    };

    try {
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) {
        if (errorDiv) {
          errorDiv.textContent = data.message || "Registration failed!";
          errorDiv.classList.remove("hidden");
        }
        return;
      }
      // Success
      if (errorDiv) {
        errorDiv.textContent = "Account created successfully! Redirecting to login...";
        errorDiv.classList.remove("hidden");
        errorDiv.classList.remove("text-red-500");
        errorDiv.classList.add("text-green-600");
      }
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1200);
    } catch (err) {
      if (errorDiv) {
        errorDiv.textContent = "Registration failed. Please try again.";
        errorDiv.classList.remove("hidden");
      }
    }
  });
}

// LOGIN
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorDiv = document.getElementById("login-error");
    if (errorDiv) {
      errorDiv.classList.add("hidden");
      errorDiv.textContent = "";
    }

    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = await res.json();
        if (errorDiv) {
          errorDiv.textContent = data.message || "Invalid email or password!";
          errorDiv.classList.remove("hidden");
        }
        return;
      }
      const user = await res.json();
      localStorage.setItem("currentUser", JSON.stringify(user));

      // --- CART SYNC ON LOGIN ---
      const localCart = JSON.parse(localStorage.getItem("cart")) || [];
      if (localCart.length > 0 && user && user._id) {
        // Prepare items for API: [{ productId, quantity }]
        const items = localCart.map(item => ({
          productId: typeof item._id === 'object' && item._id.$oid ? item._id.$oid : String(item._id),
          quantity: item.quantity
        }));
        await fetch(`http://localhost:5000/api/cart/merge/${user._id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items })
        });
        localStorage.removeItem("cart");
      }
      
      // Initialize chatbot after successful login
      setTimeout(() => {
        if (typeof initializeChatbot === 'function') {
          initializeChatbot();
        }
      }, 100);
      
      // Redirect based on user role
      if (user.role === "seller") {
        window.location.href = "seller-dashboard.html";
      } else {
        window.location.href = "index.html";
      }
    } catch (err) {
      if (errorDiv) {
        errorDiv.textContent = "Login failed. Please try again.";
        errorDiv.classList.remove("hidden");
      }
    }
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
    // Show only first name
    let firstName = user.name ? user.name.split(' ')[0] : '';
    userInfo.textContent = `Hello, ${firstName}`;
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
    // Trigger chatbot re-initialization
    if (typeof initializeChatbot === 'function') {
      initializeChatbot();
    }
    window.location.reload();
  }
});


const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    alert("Logged out successfully!");
    updateHeader();
    // Trigger chatbot re-initialization
    if (typeof initializeChatbot === 'function') {
      initializeChatbot();
    }
    window.location.href = "index.html";
  });
}

// Call updateHeader on page load
document.addEventListener("DOMContentLoaded", () => {
  updateHeader();
  // Initialize chatbot if available
  if (typeof initializeChatbot === 'function') {
    initializeChatbot();
  }
});