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

  if (!productId) {
    document.getElementById("product-details").innerHTML =
      `<p class="text-center text-gray-400">No product selected.</p>`;
    return;
  }

  // Fetch product & reviews in parallel
  const [productRes, reviewsRes] = await Promise.all([
    fetch("data/products.json"),
    fetch("data/reviews.json")
  ]);

  const products = await productRes.json();
  const allReviews = await reviewsRes.json();

  const product = products.find(p => p._id.$oid === productId);
  const reviews = allReviews.filter(r => r.productId === productId);

  if (!product) {
    document.getElementById("product-details").innerHTML =
      `<p class="text-center text-gray-400">Product not found.</p>`;
    return;
  }

  renderProduct(product, reviews);
}

function renderProduct(product, reviews) {
  const container = document.getElementById("product-details");
  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-10">

      <!-- Left: Images -->
      <div class="space-y-4">
        <img src="${product.images[0]}" class="w-full h-96 object-contain rounded-lg bg-gray-800" id="main-image"/>
        <div class="grid grid-cols-4 gap-2">
          ${product.images.map(img => `
            <img src="${img}" class="h-20 w-full object-cover rounded-md cursor-pointer hover:ring-2 hover:ring-yellow-400 thumb-img"/>
          `).join("")}
        </div>
      </div>

      <!-- Right: Details -->
      <div class="space-y-4">
        <h1 class="text-3xl font-bold">${product.name}</h1>
        <div class="text-yellow-400 text-lg">⭐ ${product.rating} (${product.ratingTotal} reviews)</div>

        <div class="flex items-center space-x-3">
          <span class="text-green-400 text-3xl font-bold">₹${product.price}</span>
          <span class="text-gray-500 line-through text-lg">₹${product.mrp}</span>
          <span class="text-red-400 text-lg">${product.discount}% OFF</span>
        </div>

        <p class="text-sm ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}">
          ${product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock'}
        </p>

        <p class="text-gray-300">${product.description}</p>

        <div class="flex space-x-4 pt-4">
          <button class="bg-yellow-400 text-black font-bold px-6 py-3 rounded-full hover:bg-yellow-300">
            Add to Cart
          </button>
          <button class="bg-green-500 text-white font-bold px-6 py-3 rounded-full hover:bg-green-400">
            Buy Now
          </button>
        </div>

        <!-- REVIEWS SECTION -->
        <section class="pt-8 border-t border-gray-700">
          <h2 class="text-2xl font-bold mb-4">Customer Reviews</h2>

          <!-- Reviews List -->
          <div id="reviews-list" class="space-y-4">
            ${
              reviews.length > 0
                ? reviews.map(r => `
                  <div class="bg-gray-800 p-4 rounded-lg shadow">
                    <div class="flex justify-between items-center">
                      <span class="font-bold">${r.user}</span>
                      <span class="text-yellow-400">⭐ ${r.rating}</span>
                    </div>
                    <p class="text-gray-300 mt-2">${r.comment}</p>
                  </div>
                `).join("")
                : `<p class="text-gray-500">No reviews yet. Be the first to review!</p>`
            }
          </div>

          <!-- Review Form -->
          <form id="review-form" class="mt-6 bg-gray-800 p-4 rounded-lg">
            <h3 class="text-xl font-semibold mb-3">Write a Review</h3>
            <input type="text" id="reviewer-name" placeholder="Your name"
              class="w-full p-2 mb-3 rounded bg-gray-700 text-white" required>

            <select id="review-rating"
              class="w-full p-2 mb-3 rounded bg-gray-700 text-white" required>
              <option value="">Select rating</option>
              <option value="1">⭐ 1</option>
              <option value="2">⭐ 2</option>
              <option value="3">⭐ 3</option>
              <option value="4">⭐ 4</option>
              <option value="5">⭐ 5</option>
            </select>

            <textarea id="review-comment" rows="3"
              class="w-full p-2 mb-3 rounded bg-gray-700 text-white"
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

    // Append new review to the DOM
    document.getElementById("reviews-list").innerHTML += `
      <div class="bg-gray-800 p-4 rounded-lg shadow">
        <div class="flex justify-between items-center">
          <span class="font-bold">${name}</span>
          <span class="text-yellow-400">⭐ ${rating}</span>
        </div>
        <p class="text-gray-300 mt-2">${comment}</p>
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

  const existingItem = cart.find(item => item._id.$oid === product._id.$oid);
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
