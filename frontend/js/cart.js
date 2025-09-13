// ✅ Load components dynamically
async function loadComponent(id, file) {
  const res = await fetch(file);
  document.getElementById(id).innerHTML = await res.text();
}

// ✅ Load header first, then show cart or login prompt
loadComponent("header", "components/header.html").then(() => {
  if (typeof updateHeader === "function") updateHeader(); // 🔑 make sure header updates
  updateCartCount();
  showCart();
});

loadComponent("footer", "components/footer.html");

// ✅ Show login prompt or cart content
function showCart() {
  const container = document.getElementById("cart-container");
  if (!container) return; // prevent errors if ID missing

  const user = JSON.parse(localStorage.getItem("currentUser"));

  if (!user) {
    container.innerHTML = `
      <div class="bg-gray-800 p-6 rounded-lg text-center">
        <h2 class="text-2xl font-bold mb-4">Please Login</h2>
        <p class="mb-6 text-gray-400">You must be logged in to view your cart.</p>
        <a href="login.html" class="bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-300">
          Go to Login
        </a>
      </div>
    `;
    return;
  }

  loadCart(); // only load cart if logged in
}

// ✅ Update cart badge in header
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalQty = cart.reduce((acc, item) => acc + item.quantity, 0);
  const badge = document.getElementById("cart-count");
  if (!badge) return;

  if (totalQty > 0) {
    badge.innerText = totalQty;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

// ✅ Load and render cart items
function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.getElementById("cart-container");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `<p class="text-gray-400">Your cart is empty.</p>`;
    return;
  }

  let total = 0;
  container.innerHTML = cart.map(item => {
    total += item.price * item.quantity;
    return `
      <div class="bg-gray-800 p-4 mb-4 rounded-lg flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <img src="${item.images[0]}" class="w-20 h-20 object-cover rounded-lg">
          <div>
            <h2 class="text-lg font-bold">${item.name}</h2>
            <p class="text-green-400">₹${item.price}</p>
            <div class="flex items-center mt-2 space-x-2">
              <button class="bg-gray-700 px-2 rounded text-xl" onclick="changeQty('${item._id.$oid}', -1)">-</button>
              <span>${item.quantity}</span>
              <button class="bg-gray-700 px-2 rounded text-xl" onclick="changeQty('${item._id.$oid}', 1)">+</button>
            </div>
          </div>
        </div>
        <button class="text-red-500 hover:underline" onclick="removeItem('${item._id.$oid}')">
          Remove
        </button>
      </div>
    `;
  }).join("") + `
    <div class="bg-gray-700 p-4 rounded-lg mt-6 flex justify-between items-center">
      <span class="text-xl font-bold">Total:</span>
      <span class="text-2xl text-green-400 font-bold">₹${total}</span>
    </div>

    <button onclick="goToCheckout()" 
      class="mt-4 bg-green-500 hover:bg-green-400 text-white w-full py-3 rounded-lg text-xl font-bold">
      Proceed to Checkout
    </button>
  `;
}

// ✅ Change item quantity
function changeQty(productId, delta) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const item = cart.find(p => p._id.$oid === productId);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter(p => p._id.$oid !== productId);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    loadCart();
  }
}

// ✅ Remove item from cart
function removeItem(productId) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = cart.filter(p => p._id.$oid !== productId);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  loadCart();
}

// ✅ Navigate to checkout
function goToCheckout() {
  window.location.href = "checkout.html";
}
