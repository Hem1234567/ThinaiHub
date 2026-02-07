// --- Backend Integration (Firebase) ---
import { db } from './firebase-config.js';
import { collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {

    // --- Sticky Navigation ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        } else {
            navbar.style.background = 'rgba(249, 249, 244, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });

    // --- Mobile Menu Toggle ---
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileToggle.classList.toggle('active'); // Optional: for hamburger animation if added later
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });
    }


    // Fetch Products (Shop Page)
    const shopContainer = document.getElementById('shop-products');
    const homeContainer = document.getElementById('home-products');

    if (shopContainer || homeContainer) {
        fetchProducts();
    }

    async function fetchProducts() {
        try {
            const querySnapshot = await getDocs(collection(db, "products"));
            const products = [];
            querySnapshot.forEach((doc) => {
                products.push({ id: doc.id, ...doc.data() });
            });

            if (products.length === 0) {
                if (shopContainer) shopContainer.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No products found.</p>';
                if (homeContainer) homeContainer.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No products found.</p>';
                return;
            }

            if (shopContainer) {
                renderProducts(shopContainer, products);
            }
            if (homeContainer) {
                // Show only first 3 items for home page
                renderProducts(homeContainer, products.slice(0, 3));
            }

        } catch (err) {
            console.error("Error fetching products: ", err);
            const errorMsg = '<p style="text-align: center; grid-column: 1/-1;">Failed to load products. Please check your connection.</p>';
            if (shopContainer) shopContainer.innerHTML = errorMsg;
            if (homeContainer) homeContainer.innerHTML = errorMsg;
        }
    }

    function renderProducts(container, products) {
        container.innerHTML = products.map((p, index) => `
            <div class="product-card reveal delay-${(index % 3) * 100 + 100}">
                <div class="card-image">
                    <img src="${p.image || 'assets/products/img-1.jpg'}" alt="${p.name}">
                    <div class="product-details">
                        <h3>${p.name} <span class="tamil">${p.tamilName ? `(${p.tamilName})` : ''}</span></h3>
                        <p>${p.description || ''}</p>
                    </div>
                </div>
                <div class="card-action">
                    <p class="price">₹${p.price} <small>/ ${p.weight || '500g'}</small></p>
                    <button class="btn btn-primary add-to-cart" 
                        data-id="${p.id}" 
                        data-name="${p.name}" 
                        data-price="${p.price}" 
                        data-image="${p.image || 'assets/products/img-1.jpg'}">
                        Add to Cart
                    </button>
                </div>
            </div>
        `).join('');

        // Re-attach IntersectionObserver to new elements
        const hiddenElements = document.querySelectorAll('.reveal');
        hiddenElements.forEach((el) => observer.observe(el));
    }

    // --- Cart Logic (LocalStorage) ---
    const cartCountElement = document.querySelector('.cart-count');
    const cartContentContainer = document.getElementById('cart-content');

    // Initialize cart from local storage
    let cart = JSON.parse(localStorage.getItem('thinaiHubCart')) || [];

    // Update cart count on load
    updateCartCount();

    // Check if we are on the cart page to render items
    if (cartContentContainer) {
        renderCartPage();
    }

    // Add to Cart Logic (Event Delegation for Dynamic Elements)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            const btn = e.target;
            const product = {
                id: btn.dataset.id,
                name: btn.dataset.name,
                price: parseInt(btn.dataset.price),
                image: btn.dataset.image,
                weight: btn.nextElementSibling ? null : '500g' // Logic handled in addToCart, weight not strictly needed for ID match but good to have
            };

            addToCart(product);

            // Visual feedback
            const originalText = btn.textContent;
            btn.textContent = 'Added!';
            btn.style.backgroundColor = '#6B461F';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.backgroundColor = '';
            }, 1000);
        }
    });

    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        saveCart();
        updateCartCount();
    }

    function saveCart() {
        localStorage.setItem('thinaiHubCart', JSON.stringify(cart));
    }

    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCounts = document.querySelectorAll('.cart-count'); // Update all instances
        cartCounts.forEach(el => el.textContent = totalItems);
    }

    function renderCartPage() {
        if (!cartContentContainer) return;

        if (cart.length === 0) {
            cartContentContainer.innerHTML = `
                <div class="cart-empty">
                    <p>Your cart is currently empty.</p>
                    <a href="shop.html" class="btn btn-primary">Start Shopping</a>
                </div>`;
            return;
        }

        let total = 0;
        let html = `
            <table class="cart-items">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
        `;

        cart.map((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            html += `
                <tr>
                    <td data-label="Product">
                        <div class="item-info">
                            <img src="${item.image}" class="item-img" alt="${item.name}">
                            <span>${item.name}</span>
                        </div>
                    </td>
                    <td data-label="Price">₹${item.price}</td>
                    <td data-label="Quantity">
                        <div class="qty-controls">
                            <button class="qty-btn" onclick="window.updateQty(${index}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" onclick="window.updateQty(${index}, 1)">+</button>
                        </div>
                    </td>
                    <td data-label="Total">₹${itemTotal}</td>
                    <td data-label="Action">
                        <button class="remove-btn" onclick="window.removeItem(${index})">Remove</button>
                    </td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
            <div class="cart-summary">
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>₹${total}</span>
                </div>
                <div class="summary-row total-row">
                    <span>Total:</span>
                    <span>₹${total}</span>
                </div>
                <div style="margin-top: 30px;">
                    <button class="btn btn-primary" onclick="window.location.href='payment.html'">Proceed to Checkout</button>
                </div>
            </div>
        `;

        cartContentContainer.innerHTML = html;
    }

    // Expose functions to global scope for onclick handlers in cart
    window.updateQty = (index, change) => {
        if (cart[index].quantity + change > 0) {
            cart[index].quantity += change;
        }
        saveCart();
        updateCartCount();
        renderCartPage();
    };

    window.removeItem = (index) => {
        cart.splice(index, 1);
        saveCart();
        updateCartCount();
        renderCartPage();
    };
    window.submitOrderToBackend = async (orderData) => {
        try {
            const finalOrder = {
                ...orderData,
                date: new Date().toISOString(),
                status: 'Pending'
            };
            const docRef = await addDoc(collection(db, "orders"), finalOrder);
            console.log("Order written with ID: ", docRef.id);
            return { id: docRef.id, ...finalOrder };
        } catch (e) {
            console.error("Error adding document: ", e);
            alert('Failed to place order. Please try again.');
            return null;
        }
    };



    // --- Scroll Animations (Premium Reveal) ---
    const observerOptions = {
        threshold: 0.1, // Trigger sooner
        rootMargin: "0px 0px -20px 0px" // Less negative margin to trigger earlier
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Observe all reveal elements
    document.querySelectorAll('.reveal, .reveal-left, .reveal-scale, .fade-in').forEach(el => {
        observer.observe(el);
    });

    // --- Smooth Page Transitions ---
    // Fade in on load
    document.body.classList.add('loaded');

    // Intercept links for fade out
    document.querySelectorAll('a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Allow default behavior for hash links, external links, or empty links
            if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || this.target === '_blank') {
                return;
            }

            e.preventDefault();
            const target = href;

            document.body.classList.remove('loaded');
            document.body.classList.add('fade-out');

            setTimeout(() => {
                window.location.href = target;
            }, 400); // Match CSS transition duration
        });
    });

    // --- PWA Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }
});
