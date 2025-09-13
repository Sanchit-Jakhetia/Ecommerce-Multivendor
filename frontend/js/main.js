let products = [];
let categories = [];
let selectedCategories = new Set();
let maxPrice = 2000;
let inStockOnly = false;

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

async function loadProducts() {
  const productRes = await fetch("data/products.json");
  products = await productRes.json();

  const categoryRes = await fetch("data/categories.json");
  categories = await categoryRes.json();

  populateCategoryFilters();
  renderProducts(products);
}

function populateCategoryFilters() {
  const container = document.getElementById("category-filters");
  container.innerHTML = categories.map(cat => `
    <div>
      <input type="checkbox" id="cat-${cat._id}" data-cat="${cat._id}" class="h-4 w-4 text-yellow-400 category-checkbox">
      <label for="cat-${cat._id}" class="text-sm ml-2">${cat.name}</label>
    </div>
  `).join("");

  document.querySelectorAll(".category-checkbox").forEach(cb => {
    cb.addEventListener("change", (e) => {
      const cat = e.target.dataset.cat;
      e.target.checked ? selectedCategories.add(cat) : selectedCategories.delete(cat);
      applyFilters();
    });
  });
}

function renderProducts(productList) {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = productList.map(product => {
    const categoryName = categories.find(c => c._id === product.categoryId)?.name || "Uncategorized";
    return `
      <div class="bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 cursor-pointer product-card" 
           data-id="${product._id.$oid}">
        <img src="${product.images[0]}" class="rounded-t-2xl w-full h-56 object-cover" />
        <div class="p-5">
          <h2 class="text-lg font-bold mb-1">${product.name}</h2>
          <p class="text-xs text-gray-400 italic mb-1">Category: ${categoryName}</p>
          <div class="mt-3 flex items-center">
            <span class="text-green-400 font-bold text-xl">₹${product.price}</span>
            <span class="text-gray-500 line-through ml-2">₹${product.mrp}</span>
            <span class="text-red-400 text-sm ml-2">${product.discount}% OFF</span>
          </div>
        </div>
      </div>
    `;
  }).join("");

  // Add click listeners
  document.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      window.location.href = `product.html?id=${id}`;
    });
  });
}


function applyFilters() {
  let filtered = products.filter(p =>
    (selectedCategories.size === 0 || selectedCategories.has(p.categoryId)) &&
    p.price <= maxPrice &&
    (!inStockOnly || p.stock > 0)
  );
  renderProducts(filtered);
}

// Event Listeners
document.getElementById("price-range").addEventListener("input", (e) => {
  maxPrice = parseInt(e.target.value);
  document.getElementById("price-value").textContent = maxPrice;
  applyFilters();
});

document.getElementById("in-stock-toggle").addEventListener("change", (e) => {
  inStockOnly = e.target.checked;
  applyFilters();
});

document.getElementById("sort-products").addEventListener("change", (e) => {
  let sorted = [...products];
  if (e.target.value === "price-low-high") sorted.sort((a, b) => a.price - b.price);
  else if (e.target.value === "price-high-low") sorted.sort((a, b) => b.price - a.price);
  else if (e.target.value === "rating-high-low") sorted.sort((a, b) => b.rating - a.rating);
  renderProducts(sorted);
});

loadProducts();

// Carousel Init
new Swiper(".mySwiper", {
  spaceBetween: 30,
  centeredSlides: true,
  autoplay: { delay: 4000, disableOnInteraction: false },
  pagination: { el: ".swiper-pagination", clickable: true },
  loop: true
});
