let categories = [];
let products = [];


async function loadCategories() {
  const res = await fetch("http://localhost:5000/api/categories");
  categories = await res.json();

  // fetch all products once
  const prodRes = await fetch("http://localhost:5000/api/products");
  products = await prodRes.json();

  renderCategorySlides();
  // Show all products by default, or first category if you prefer
  renderProducts(products);
}


function renderCategorySlides() {
  const container = document.getElementById("category-slider");
  if (!categories.length) {
    container.innerHTML = '<p class="text-gray-400">No categories found</p>';
    return;
  }
  container.innerHTML = `
    <div class="flex gap-4 overflow-x-auto pb-2">
      ${categories.map(cat => {
        // pick random product image from that category
        const product = products.find(p => p.categoryId === cat._id);
        const thumbnail = product ? product.images[0] : "https://via.placeholder.com/300x200";
        return `
          <button
            class="category-btn bg-white border border-yellow-200 rounded-xl px-6 py-4 font-semibold text-gray-700 shadow hover:bg-yellow-50 transition flex flex-col items-center mx-2 my-2"
            data-category="${cat._id}"
          >
            <img src="${thumbnail}" class="w-16 h-16 object-cover rounded mb-2 bg-gray-100" loading="lazy"/>
            <span>${cat.name}</span>
          </button>
        `;
      }).join('')}
    </div>
  `;
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const catId = btn.dataset.category;
      filterProductsByCategory(catId);
      // Highlight selected
      document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('ring-2', 'ring-yellow-400'));
      btn.classList.add('ring-2', 'ring-yellow-400');
    });
  });
}


function filterProductsByCategory(catId) {
  const filtered = products.filter(p => p.categoryId === catId);
  renderProducts(filtered);
}

function renderProducts(productList) {
  const grid = document.getElementById("product-grid");
  if (productList.length === 0) {
    grid.innerHTML = `<p class="col-span-full text-center text-gray-400">No products found</p>`;
    return;
  }

  grid.innerHTML = productList.map(product => `
    <div class="bg-white border border-gray-200 rounded-2xl shadow hover:shadow-lg 
                transition transform hover:-translate-y-1 cursor-pointer product-card" 
         data-id="${product._id}">
   <img src="${product.images[0]}" 
     class="rounded-t-2xl w-full h-56 object-cover bg-gray-100" loading="lazy"/>
      <div class="p-5">
        <h2 class="text-lg font-bold mb-1 text-gray-900">${product.name}</h2>
        <div class="mt-3 flex items-center">
          <span class="text-green-600 font-bold text-xl">₹${product.price}</span>
          <span class="text-gray-400 line-through ml-2">₹${product.mrp}</span>
          <span class="text-red-500 text-sm ml-2">${product.discount}% OFF</span>
        </div>
      </div>
    </div>
  `).join("");

  // Add click to go to product page
  document.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      window.location.href = `product.html?id=${id}`;
    });
  });
}

// Init
loadCategories();
