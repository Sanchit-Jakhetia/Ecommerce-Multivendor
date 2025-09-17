async function loadComponent(id, file) {
  const res = await fetch(file);
  document.getElementById(id).innerHTML = await res.text();
}

loadComponent("header", "components/header.html").then(() => {
  if (typeof updateHeader === "function") updateHeader();
  updateCartCount();
});
loadComponent("footer", "components/footer.html");

async function loadProduct() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  // Fetch product and reviews from backend
  const [productRes, reviewsRes] = await Promise.all([
    fetch(`http://localhost:5000/api/products/${productId}`),
    fetch(`http://localhost:5000/api/reviews?productId=${productId}`)
  ]);

  if (!productRes.ok) {
    document.getElementById("product-details").innerHTML =
      `<p class="text-center text-gray-400">Product not found.</p>`;
    return;
  }

  const product = await productRes.json();
  const reviews = reviewsRes.ok ? await reviewsRes.json() : [];

  renderProduct(product, reviews);
}

function renderProduct(product, reviews) {
  const container = document.getElementById("product-details");
  container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">

        <!-- Left: Images -->
        <div class="space-y-4">
          <img src="${product.images[0]}" class="w-full max-w-[58rem] h-[44rem] object-contain rounded-2xl bg-gray-100 border border-gray-200 shadow-lg mx-auto" id="main-image"/>
          <div class="grid grid-cols-4 gap-2">
            ${product.images.map(img => `
              <img src="${img}" class="h-20 w-full object-cover rounded-md cursor-pointer hover:ring-2 hover:ring-yellow-400 thumb-img bg-gray-100 border border-gray-200"/>
            `).join("")}
          </div>
        </div>

        <!-- Right: Details -->
        <div class="space-y-4">
          <h1 class="text-3xl font-bold text-gray-900">${product.name}</h1>
          <div class="text-yellow-500 text-lg">⭐ ${product.rating} (${product.ratingTotal} reviews)</div>

          <div class="flex items-center space-x-3">
            <span class="text-green-600 text-3xl font-bold">₹${product.price}</span>
            <span class="text-gray-400 line-through text-lg">₹${product.mrp}</span>
            <span class="text-red-500 text-lg">${product.discount}% OFF</span>
          </div>

          <p class="text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}">
            ${product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock'}
          </p>

          <p class="text-gray-700">${product.description}</p>

          <div class="flex space-x-4 pt-4">
            <button class="bg-yellow-400 text-black font-bold px-6 py-3 rounded-full hover:bg-yellow-300">
              Add to Cart
            </button>
            <button class="bg-green-500 text-white font-bold px-6 py-3 rounded-full hover:bg-green-400">
              Buy Now
            </button>
          </div>

          <!-- REVIEWS SECTION -->
          <section class="pt-8 border-t border-gray-200">
            <h2 class="text-2xl font-bold mb-4 text-gray-900">Customer Reviews</h2>

            <!-- Reviews List -->
            <div id="reviews-list" class="space-y-4">
              ${
                reviews.length > 0
                  ? reviews.map(r => `
                    <div class="bg-gray-50 p-4 rounded-lg shadow border border-gray-200">
                      <div class="flex justify-between items-center">
                        <span class="font-bold text-gray-900">${r.user}</span>
                        <span class="text-yellow-500">⭐ ${r.rating}</span>
                      </div>
                      <p class="text-gray-700 mt-2">${r.comment}</p>
                    </div>
                  `).join("")
                  : `<p class="text-gray-500">No reviews yet. Be the first to review!</p>`
              }
            </div>

            <!-- Review Form -->
            <form id="review-form" class="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 class="text-xl font-semibold mb-3 text-gray-900">Write a Review</h3>
              <input type="text" id="reviewer-name" placeholder="Your name"
                class="w-full p-2 mb-3 rounded bg-white text-gray-900 border border-gray-200" required>

              <select id="review-rating"
                class="w-full p-2 mb-3 rounded bg-white text-gray-900 border border-gray-200" required>
                <option value="">Select rating</option>
                <option value="1">⭐ 1</option>
                <option value="2">⭐ 2</option>
                <option value="3">⭐ 3</option>
                <option value="4">⭐ 4</option>
                <option value="5">⭐ 5</option>
              </select>
              <textarea id="review-comment" rows="3"
                class="w-full p-2 mb-3 rounded bg-white text-gray-900 border border-gray-200"
                placeholder="Write your review..." required></textarea>

              <button type="submit"
                class="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded">
                Submit Review
              </button>
            </form>
          </section>
        </div>
      </div>
    `;

  // Thumbnail click event
  document.querySelectorAll(".thumb-img").forEach(img => {
    img.addEventListener("click", (e) => {
      document.getElementById("main-image").src = e.target.src;
    });
  });

  // Handle new review submission
  document.getElementById("review-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("reviewer-name").value;
    const rating = parseInt(document.getElementById("review-rating").value);
    const comment = document.getElementById("review-comment").value;

    // Append new review to the DOM (light mode)
    document.getElementById("reviews-list").innerHTML += `
      <div class="bg-gray-50 p-4 rounded-lg shadow border border-gray-200">
        <div class="flex justify-between items-center">
          <span class="font-bold text-gray-900">${name}</span>
          <span class="text-yellow-500">⭐ ${rating}</span>
        </div>
        <p class="text-gray-700 mt-2">${comment}</p>
      </div>
    `;

    // Reset form
    e.target.reset();
  });

  document.querySelector("button.bg-yellow-400").addEventListener("click", () => {
    addToCart(product);
  });
}

function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];


  const existingItem = cart.find(item => item._id === product._id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  alert(`${product.name} added to cart!`);
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalQty = cart.reduce((acc, item) => acc + item.quantity, 0);

  document.getElementById("cart-count").innerText = totalQty;
}

// Call updateCartCount on page load
document.addEventListener("DOMContentLoaded", updateCartCount);

loadProduct();
