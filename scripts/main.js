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
            if (navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
                // Reset styles for drop down
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = 'white';
                navLinks.style.padding = '20px';
                navLinks.style.boxShadow = '0 5px 10px rgba(0,0,0,0.1)';
            }
        });
    }

    // --- Cart Logic (LocalStorage) ---
    const cartButtons = document.querySelectorAll('.add-to-cart');
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

    // Add to Cart Event Listeners
    cartButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id || Date.now().toString(); // Fallback ID if missing
            const name = e.target.dataset.name;
            const priceText = e.target.parentElement.querySelector('.price')?.childNodes[0].textContent.trim().replace('₹', '') || '150';
            const price = parseInt(priceText);
            const imageSrc = e.target.closest('.product-card').querySelector('img').src;

            addToCart({ id, name, price, image: imageSrc });

            // Visual feedback
            const originalText = btn.textContent;
            btn.textContent = 'Added!';
            btn.style.backgroundColor = '#6B461F';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.backgroundColor = '';
            }, 1000);
        });
    });

    function addToCart(product) {
        const existingItem = cart.find(item => item.name === product.name); // Simple match by name for now

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
                            <button class="qty-btn" onclick="updateQty(${index}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
                        </div>
                    </td>
                    <td data-label="Total">₹${itemTotal}</td>
                    <td data-label="Action">
                        <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
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

    // Expose functions to global scope for onclick handlers
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
});
