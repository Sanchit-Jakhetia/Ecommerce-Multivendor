// seller-dashboard.js
// This script populates the seller dashboard with mock/demo data. Replace with real API calls as needed.

document.addEventListener('DOMContentLoaded', () => {
  // Modal logic for add/edit product
  const productModal = document.getElementById('product-modal');
  const addProductBtn = document.getElementById('add-product-btn');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const productForm = document.getElementById('product-form');
  const modalTitle = document.getElementById('modal-title');
  const productIdInput = document.getElementById('product-id');
  const productNameInput = document.getElementById('product-name');
  const productPriceInput = document.getElementById('product-price');
  const productStockInput = document.getElementById('product-stock');
  const productImageInput = document.getElementById('product-image');
  const productDescInput = document.getElementById('product-description');

  function openProductModal(editProduct = null) {
    if (editProduct) {
      modalTitle.textContent = 'Edit Product';
      productIdInput.value = editProduct._id || '';
      productNameInput.value = editProduct.name || '';
      productPriceInput.value = editProduct.price || '';
      productStockInput.value = editProduct.stock || '';
      productImageInput.value = (editProduct.images && editProduct.images[0]) || '';
      productDescInput.value = editProduct.description || '';
    } else {
      modalTitle.textContent = 'Add Product';
      productIdInput.value = '';
      productNameInput.value = '';
      productPriceInput.value = '';
      productStockInput.value = '';
      productImageInput.value = '';
      productDescInput.value = '';
    }
    productModal.classList.remove('hidden');
  }
  function closeProductModal() {
    productModal.classList.add('hidden');
  }
  if (addProductBtn) addProductBtn.onclick = () => openProductModal();
  if (closeModalBtn) closeModalBtn.onclick = closeProductModal;
  if (productModal) productModal.addEventListener('click', e => {
    if (e.target === productModal) closeProductModal();
  });

  // TODO: Add submit logic for productForm (add/update)
  // Simulate current seller (replace with real auth logic)
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser || currentUser.role !== 'seller') {
    document.body.innerHTML = '<div class="text-center text-2xl text-red-500 mt-20">Access denied. Seller login required.</div>';
    return;
  }

  const API_BASE_URL = "http://localhost:5000/api/sellers/" + currentUser._id;


  // Fetch products and calculate product count and avg rating
  let productCount = 0;
  let avgRating = '0.00';
  fetch("http://localhost:5000/api/products")
    .then(res => res.json())
    .then(products => {
      // Filter products by current seller's ID
      const sellerProducts = products.filter(p => {
        // p.sellerId may be string or object
        if (!p.sellerId) return false;
        if (typeof p.sellerId === 'object' && p.sellerId._id) {
          return p.sellerId._id === currentUser._id;
        }
        return p.sellerId === currentUser._id;
      });
      const prodDiv = document.getElementById('seller-products');
      if (!sellerProducts.length) {
        prodDiv.innerHTML = '<div class="text-gray-400">No products found.</div>';
        document.getElementById('product-count').textContent = 0;
        document.getElementById('avg-rating').textContent = '0.00';
        return;
      }
      const prodTbody = document.getElementById('seller-products-tbody');
      if (prodTbody) {
        prodTbody.innerHTML = sellerProducts.map(p => `
          <tr>
            <td class="py-2 px-4"><img src="${(p.images && p.images[0]) || ''}" alt="${p.name}" class="h-12 w-12 object-cover rounded" /></td>
            <td class="py-2 px-4 font-bold">${p.name}</td>
            <td class="py-2 px-4 text-green-700 font-bold">₹${p.price}</td>
            <td class="py-2 px-4">${p.stock}</td>
            <td class="py-2 px-4 text-yellow-500">${p.rating}</td>
          </tr>
        `).join('');
      }

      // Calculate stats
      productCount = sellerProducts.length;
      let totalRating = 0;
      let ratingCount = 0;
      sellerProducts.forEach(p => {
        if (typeof p.rating === 'number' && p.ratingTotal) {
          totalRating += p.rating * p.ratingTotal;
          ratingCount += p.ratingTotal;
        } else if (typeof p.rating === 'number') {
          totalRating += p.rating;
          ratingCount += 1;
        }
      });
      avgRating = ratingCount ? (totalRating / ratingCount).toFixed(2) : '0.00';
      document.getElementById('product-count').textContent = productCount;
      document.getElementById('avg-rating').textContent = avgRating;
    });

  // Fetch recent orders (only seller's items) and calculate total sales
  fetch(`http://localhost:5000/api/orders/seller/${currentUser._id}`)
    .then(res => res.json())
    .then(orders => {
      const ordersTbody = document.getElementById('orders-table-body');
      if (!orders.length) {
        ordersTbody.innerHTML = '<tr><td colspan="5" class="text-center text-gray-400">No orders found.</td></tr>';
        document.getElementById('total-sales').textContent = '₹0';
        return;
      }
      let totalSales = 0;
      ordersTbody.innerHTML = orders.map(o =>
        o.items.map(item => {
          totalSales += item.price * item.quantity;
          // Status badge color logic
          let statusColor = 'bg-gray-300 text-gray-800';
          if (o.status === 'Delivered' || o.status === 'delivered') statusColor = 'bg-green-100 text-green-700';
          else if (o.status === 'Shipped' || o.status === 'shipped') statusColor = 'bg-blue-100 text-blue-700';
          else if (o.status === 'Pending' || o.status === 'pending') statusColor = 'bg-yellow-100 text-yellow-700';
          else if (o.status === 'Cancelled' || o.status === 'cancelled') statusColor = 'bg-red-100 text-red-700';
          return `
            <tr>
              <td class="py-2 px-4">${o._id}</td>
              <td class="py-2 px-4">${item.productId && item.productId.name ? item.productId.name : ''}</td>
              <td class="py-2 px-4">${o.buyer && o.buyer.name ? o.buyer.name : ''}</td>
              <td class="py-2 px-4">₹${item.price * item.quantity}</td>
              <td class="py-2 px-4">
                <span class="inline-block px-3 py-1 rounded-full font-semibold text-xs ${statusColor}">${o.status}</span>
              </td>
            </tr>
          `;
        }).join('')
      ).join('');
      document.getElementById('total-sales').textContent = '₹' + totalSales;
    });
});
