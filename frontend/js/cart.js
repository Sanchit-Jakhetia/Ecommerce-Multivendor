// cart.js
// This script handles displaying the cart for the current user

document.addEventListener('DOMContentLoaded', () => {
    // Simulate getting current user (replace with real auth logic)
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Get cart from localStorage (or backend in real app)
    let cart = JSON.parse(localStorage.getItem('cart_' + currentUser.id)) || [];

    const cartItemsDiv = document.getElementById('cart-items');
    const cartSummaryDiv = document.getElementById('cart-summary');

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<div class="text-center text-gray-500 text-lg">Your cart is empty.</div>';
        cartSummaryDiv.innerHTML = '';
        return;
    }

    // Fetch products data (simulate API call)
    fetch('data/products.json')
        .then(res => res.json())
        .then(products => {
            let total = 0;
            cartItemsDiv.innerHTML = '';
            cart.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    const itemTotal = product.price * item.quantity;
                    total += itemTotal;
                    cartItemsDiv.innerHTML += `
                        <div class="product-card flex flex-col bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
                            <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
                            <div class="product-info p-4 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 class="product-name text-lg font-bold mb-2">${product.name}</h3>
                                    <div class="flex items-center mb-2">
                                        <span class="product-price text-green-700 font-bold text-xl">$${product.price}</span>
                                    </div>
                                    <div class="text-gray-600 mb-2">Quantity: <span class="font-semibold">${item.quantity}</span></div>
                                    <div class="text-gray-700">Total: <span class="font-semibold">$${itemTotal}</span></div>
                                </div>
                            </div>
                        </div>
                    `;
                }
            });
            cartSummaryDiv.innerHTML = `
                <div class="bg-white rounded-xl shadow p-6 max-w-md mx-auto mt-8">
                    <h2 class="text-2xl font-bold mb-4">Cart Summary</h2>
                    <div class="flex justify-between text-lg mb-2">
                        <span>Total:</span>
                        <span class="font-bold text-green-700">$${total}</span>
                    </div>
                    <button id="checkout-btn" class="w-full mt-4 bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 rounded-lg transition">Checkout</button>
                </div>
            `;
        });
});
