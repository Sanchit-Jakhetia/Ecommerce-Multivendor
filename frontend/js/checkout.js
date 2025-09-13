async function loadComponent(id, file) {
  const res = await fetch(file);
  document.getElementById(id).innerHTML = await res.text();
}

loadComponent("header", "components/header.html").then(() => {
  if (typeof updateHeader === "function") updateHeader();
  updateCartCount();
  loadCheckout();
});


loadComponent("footer", "components/footer.html");

function loadCheckout() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const container = document.getElementById("checkout-container");

  if (cart.length === 0) {
    container.innerHTML = `<p class="text-gray-400">Your cart is empty.</p>`;
    return;
  }

  let total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  container.innerHTML = `
    <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 class="text-xl font-bold mb-4">Shipping Details</h2>
      <p><strong>Name:</strong> ${user.name}</p>
      <p><strong>Email:</strong> ${user.email}</p>

      <h2 class="text-xl font-bold mt-6 mb-4">Order Summary</h2>
      ${cart.map(item => `
        <div class="flex justify-between mb-2">
          <span>${item.name} (x${item.quantity})</span>
          <span>₹${item.price * item.quantity}</span>
        </div>
      `).join("")}

      <div class="border-t border-gray-700 mt-4 pt-4 flex justify-between text-lg font-bold">
        <span>Total:</span>
        <span class="text-green-400">₹${total}</span>
      </div>

      <button onclick="placeOrder()" 
        class="mt-6 w-full bg-green-500 hover:bg-green-400 text-white py-3 rounded-lg text-xl font-bold">
        Place Order
      </button>
    </div>
  `;
}

function placeOrder() {
  alert("🎉 Order placed successfully!");
  localStorage.removeItem("cart");
  window.location.href = "index.html";
}
