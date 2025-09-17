let categories = [];
let products = [];

async function loadCategories() {
  const res = await fetch("http://localhost:5000/api/categories");
  categories = await res.json();

  // fetch all products once
  const prodRes = await fetch("http://localhost:5000/api/products");
  products = await prodRes.json();

  renderCategorySlides();
}

function renderCategorySlides() {
  const container = document.getElementById("category-slider");
  container.innerHTML = categories.map(cat => {
    // pick random product image from that category
    const product = products.find(p => p.categoryId === cat._id);
    const thumbnail = product ? product.images[0] : "https://via.placeholder.com/300x200";

    return `
      <div class="swiper-slide cursor-pointer category-slide group" data-id="${cat._id}">
        <div class="bg-white border border-gray-200 rounded-2xl shadow hover:shadow-yellow-200/80 
                    hover:scale-105 transform transition-all duration-300 group-[.active]:ring-2 group-[.active]:ring-yellow-400">
          <img src="${thumbnail}" 
               class="rounded-t-2xl h-40 w-full object-cover bg-gray-100"/>
          <div class="p-4 text-center">
            <h3 class="text-lg font-semibold text-yellow-500">${cat.name}</h3>
          </div>
        </div>
      </div>
    `;
  }).join("");

  // Swiper init
  new Swiper(".mySwiper", {
    slidesPerView: 2,
    spaceBetween: 20,
    breakpoints: {
      640: { slidesPerView: 3 },
      1024: { slidesPerView: 5 },
    },
    pagination: { el: ".swiper-pagination", clickable: true },
  });

  // click events
  document.querySelectorAll(".category-slide").forEach(slide => {
    slide.addEventListener("click", () => {
      // Remove active from all
      document.querySelectorAll('.category-slide').forEach(s => s.classList.remove('active'));
      slide.classList.add('active');
      const id = slide.dataset.id;
      filterProductsByCategory(id);
    });
  });
}

function filterProductsByCategory(catId) {
  const selected = categories.find(c => c._id === catId);
  document.getElementById("selected-category-title").textContent = 
    selected ? `Showing: ${selected.name}` : "Products";

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
           class="rounded-t-2xl w-full h-56 object-cover bg-gray-100"/>
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
