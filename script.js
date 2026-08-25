// Initialize Supabase client safely on pages that load the library
if (window.supabase && typeof window.supabase.createClient === 'function') {
  window.supabaseClient = window.supabase.createClient(
    'https://fjhlglaivlbrowsuxres.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqaGxnbGFpdmxicm93c3V4cmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1OTUwNDYsImV4cCI6MjA2NjE3MTA0Nn0.0p7afOyJ_Q67d0k7ZTQWnxYIJ6eseuNx_7yjupT6eWo'
  );
} else {
  // Defer until DOM ready in case the library loads later in the body
  window.addEventListener('DOMContentLoaded', () => {
    if (!window.supabaseClient && window.supabase && typeof window.supabase.createClient === 'function') {
      window.supabaseClient = window.supabase.createClient(
        'https://fjhlglaivlbrowsuxres.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqaGxnbGFpdmxicm93c3V4cmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1OTUwNDYsImV4cCI6MjA2NjE3MTA0Nn0.0p7afOyJ_Q67d0k7ZTQWnxYIJ6eseuNx_7yjupT6eWo'
      );
    }
  });
}
// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = count;
        // Also show/hide the badge if count is 0
        if (count > 0) {
            cartCountElement.style.display = 'flex';
        } else {
            cartCountElement.style.display = 'none';
        }
    }
}

function addToCart(arg1, name, category, price, image) {
    let item_name = '';

    // Check if the first argument is an object (the 'part' object)
    if (typeof arg1 === 'object' && arg1 !== null && name === undefined) {
        const part = arg1;
        item_name = part.name;
        const existingItem = cart.find(item => item.id === part.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: part.id,
                brand: part.brand,
                name: part.name,
                model: part.model,
                category: part.category,
                price: part.price,
                image: part.image_url,
                quantity: 1
            });
        }
    } else { // This is the old way of calling it
        const brand = arg1;
        item_name = name;
        // Use a composite key for older items that don't have a UUID
        const itemId = `${brand}-${name}`;
        const existingItem = cart.find(item => item.id === itemId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: itemId,
                brand: brand,
                name: name,
                category: category,
                price: price,
                image: image,
                model: 'N/A', // Legacy items might not have a model
                quantity: 1
            });
        }
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${item_name} added to cart`);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    showCartModal();
    updateCartCount();
    // Render cart page if on cart.html
    if (window.location.pathname.includes('/services/cart.html')) {
        renderCartPage();
    }
}

function updateQuantity(index, delta) {
    cart[index].quantity = Math.max(1, cart[index].quantity + delta);
    localStorage.setItem('cart', JSON.stringify(cart));
    showCartModal();
    updateCartCount();
}

function showCartModal() {
    const modal = document.getElementById('cart-modal');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (!modal || !cartItems || !cartTotal) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty</p>';
        cartTotal.textContent = '0';
        modal.style.display = 'block';
        return;
    }
    
    let total = 0;
    cartItems.innerHTML = cart.map((item, index) => {
        total += item.price * item.quantity;
        return `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" style="width:50px;height:50px;object-fit:cover;margin-right:1rem;">
                <div style="flex:1">
                    <h4 style="margin:0">${item.brand} ${item.name}</h4>
                    <p style="margin:0.2rem 0;color:#666">${item.category}</p>
                    <p style="margin:0;color:var(--primary-blue)">₹${item.price}</p>
                </div>
                <div style="display:flex;align-items:center;gap:0.5rem;">
                    <button onclick="updateQuantity(${index}, -1)" class="quantity-btn">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${index}, 1)" class="quantity-btn">+</button>
                    <button onclick="removeFromCart(${index})" class="remove-btn">&times;</button>
                </div>
            </div>
        `;
    }).join('');
    
    cartTotal.textContent = total.toLocaleString();
    modal.style.display = 'block';
}

function closeCartModal() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function checkoutCart() {
    if (cart.length === 0) return;
    
    const message = cart.map(item => 
        `${item.brand} ${item.name} (${item.category}) - ₹${item.price} x ${item.quantity}`
    ).join('\n');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const finalMessage = `I would like to order:\n${message}\n\nTotal: ₹${total}`;
    
    window.open(`https://wa.me/917310542113?text=${encodeURIComponent(finalMessage)}`);
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    closeCartModal();
    updateCartCount();
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize cart if we're on a page that uses it
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        updateCartCount();
    }
    // Render cart page if on cart.html
    if (window.location.pathname.includes('/services/cart.html')) {
        renderCartPage();
    }
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('cart-modal');
    if (modal && event.target === modal) {
        closeCartModal();
    }
}

// --- START: Cart Page Specific Functions ---

function renderCartPage() {
    const cartContainer = document.querySelector('.cart-items-section');
    const summaryContainer = document.querySelector('.cart-summary-section');
    
    // Exit if not on the cart page
    if (!cartContainer || !summaryContainer) {
        return;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    const emptyState = cartContainer.querySelector('.empty-state');
    const placeOrderBtnContainer = cartContainer.querySelector('.place-order-container');
    const addressHeader = cartContainer.querySelector('.cart-address-header');

    // Clear previously rendered items to prevent duplication
    const existingItems = cartContainer.querySelectorAll('.cart-item-card');
    existingItems.forEach(item => item.remove());

    if (cart.length === 0) {
        if (emptyState) emptyState.style.display = 'flex'; // Use flex for centering
        if (placeOrderBtnContainer) placeOrderBtnContainer.style.display = 'none';
        if (addressHeader) addressHeader.style.display = 'none';

        // Reset summary
        const priceItems = summaryContainer.querySelector('.price-row span:first-child');
        const priceValue = summaryContainer.querySelector('.price-row span:last-child');
        const totalValue = summaryContainer.querySelector('.price-total span:last-child');
        
        if(priceItems) priceItems.textContent = `Price (0 items)`;
        if(priceValue) priceValue.textContent = `₹0`;
        if(totalValue) totalValue.textContent = `₹0`;

        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (placeOrderBtnContainer) placeOrderBtnContainer.style.display = 'flex';
    if (addressHeader) addressHeader.style.display = 'flex';


    let itemsHtml = '';
    let totalPrice = 0;
    let totalItems = 0;

    cart.forEach((item, index) => {
        const itemTotal = (item.price || 0) * (item.quantity || 0);
        totalPrice += itemTotal;
        totalItems += item.quantity;
        const defaultImage = '../images/image-removebg-preview (1).png';

        itemsHtml += `
            <div class="cart-item-card" data-index="${index}">
                <div class="item-image">
                    <img src="${item.image || defaultImage}" alt="${item.name}" onerror="this.onerror=null; this.src='${defaultImage}';">
                </div>
                <div class="item-details">
                    <p class="item-name">${item.brand} ${item.name}</p>
                    <p class="item-model">${item.brand} ${item.model ? `- ${item.model}` : ''}</p>
                    <p class="item-price">₹${item.price}</p>
                </div>
                <div class="item-quantity">
                    <button class="quantity-btn" onclick="updateCartPageQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartPageQuantity(${index}, 1)">+</button>
                </div>
                <div class="item-total">
                    <p>₹${itemTotal.toLocaleString()}</p>
                </div>
                <div class="item-remove">
                    <button class="remove-btn" onclick="removeFromCartPage(${index})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
    });

    if (addressHeader) {
        addressHeader.insertAdjacentHTML('afterend', itemsHtml);
    }
    
    // Update summary details
    summaryContainer.querySelector('.price-row span:first-child').textContent = `Price (${totalItems} items)`;
    summaryContainer.querySelector('.price-row span:last-child').textContent = `₹${totalPrice.toLocaleString()}`;
    summaryContainer.querySelector('.price-total span:last-child').textContent = `₹${totalPrice.toLocaleString()}`;
}

function updateCartPageQuantity(index, delta) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart[index]) {
        const newQuantity = cart[index].quantity + delta;
        if (newQuantity > 0) {
            cart[index].quantity = newQuantity;
        } else {
            cart.splice(index, 1);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartPage();
        updateCartCount();
    }
}

function removeFromCartPage(index) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart[index]) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartPage();
        updateCartCount();
    }
}

// --- END: Cart Page Specific Functions ---

// Sample vehicle data
const vehicles = [
    {
        id: 1,
        name: "Luxury Sedan 2024",
        price: "$45,000",
        image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=600&q=80",
        description: "Elegant and powerful luxury sedan with advanced features"
    },
    {
        id: 2,
        name: "SUV Premium",
        price: "$55,000",
        image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=600&q=80",
        description: "Spacious SUV perfect for family adventures"
    },
    {
        id: 3,
        name: "Sports Coupe",
        price: "$65,000",
        image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=600&q=80",
        description: "High-performance sports car for thrill-seekers"
    }
];

// Populate vehicle grid
function populateVehicles() {
    const vehicleGrid = document.querySelector('.vehicle-grid');
    if (!vehicleGrid) return;

    vehicles.forEach(vehicle => {
        const vehicleCard = document.createElement('div');
        vehicleCard.className = 'vehicle-card';
        vehicleCard.style.backgroundColor = '#fff';
        vehicleCard.style.borderRadius = '10px';
        vehicleCard.style.overflow = 'hidden';
        vehicleCard.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        vehicleCard.style.transition = 'transform 0.3s ease';

        vehicleCard.innerHTML = `
            <img src="${vehicle.image}" alt="${vehicle.name}" style="width: 100%; height: 200px; object-fit: cover;">
            <div style="padding: 1.5rem;">
                <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">${vehicle.name}</h3>
                <p style="color: var(--secondary-color); font-weight: bold; margin-bottom: 0.5rem;">${vehicle.price}</p>
                <p style="color: var(--text-color); margin-bottom: 1rem;">${vehicle.description}</p>
                <button onclick="showVehicleDetails(${vehicle.id})" 
                        style="background-color: var(--secondary-color); 
                               color: white; 
                               border: none; 
                               padding: 0.5rem 1rem; 
                               border-radius: 5px; 
                               cursor: pointer;">
                    View Details
                </button>
            </div>
        `;

        vehicleCard.addEventListener('mouseenter', () => {
            vehicleCard.style.transform = 'translateY(-5px)';
        });

        vehicleCard.addEventListener('mouseleave', () => {
            vehicleCard.style.transform = 'translateY(0)';
        });

        vehicleGrid.appendChild(vehicleCard);
    });
}

// Mobile navigation
function setupMobileNav() {
  // This was a separate mobile nav; index.html uses sidebar hamburger with id #sidebar-hamburger
  // We keep this for any page that still uses a simple hamburger/.nav-links pattern
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      hamburger.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }
  // Always initialize the unified sidebar menu used on index.html and other pages
  if (typeof setupSidebarMenu === 'function') {
    setupSidebarMenu();
  }
}

// Mobile touch improvements
function setupMobileTouch() {
    // Add touch feedback for interactive elements
    const touchElements = document.querySelectorAll('.service-card, .brand-logo-card, .bike-cards-section .bike-card, .cta-button');
    
    touchElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        element.addEventListener('touchend', function() {
            this.style.transform = '';
        });
        
        element.addEventListener('touchcancel', function() {
            this.style.transform = '';
        });
    });

    // Improve scrolling performance on mobile
    let isScrolling = false;
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            isScrolling = true;
            requestAnimationFrame(() => {
                isScrolling = false;
            });
        }
    }, { passive: true });
}

// Mobile-specific optimizations
function setupMobileOptimizations() {
    // Optimize images for mobile
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        // Add loading animation
        if (!img.complete) {
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';
        }
    });

    // Improve form interactions on mobile
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            // Scroll to input on mobile
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        });
    });

    // Optimize iframe loading for mobile
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
        iframe.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        if (!iframe.complete) {
            iframe.style.opacity = '0';
            iframe.style.transition = 'opacity 0.3s ease';
        }
    });
}

// Mobile performance optimizations
function setupMobilePerformance() {
    // Lazy load images for better performance
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Optimize animations for mobile
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
        document.documentElement.style.setProperty('--animation-duration', '0.1s');
    }
}

// Initialize mobile-specific features
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    setupMobileNav();
    setupMobileTouch();
    setupMobileOptimizations();
    setupMobilePerformance();
    
    // Add mobile-specific classes
    if (window.innerWidth <= 768) {
        document.body.classList.add('mobile-device');
    }
    
    // Handle orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            if (window.innerWidth <= 768) {
                document.body.classList.add('mobile-device');
            } else {
                document.body.classList.remove('mobile-device');
            }
        }, 100);
    });
});

// Smooth scrolling
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                // Close mobile menu if open
                const navLinks = document.querySelector('.nav-links');
                navLinks.classList.remove('active');
            }
        });
    });
}

// Format date for display
function formatDate(dateString) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Show confirmation message
function showConfirmationMessage(message, isSuccess) {
    const confirmationMessage = document.getElementById('confirmation-message');
    if (!confirmationMessage) return;

    confirmationMessage.textContent = message;
    confirmationMessage.className = 'confirmation-message ' + (isSuccess ? 'success' : 'error');
    
    // Scroll to message
    confirmationMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Vehicle details modal
function showVehicleDetails(vehicleId) {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1001';

    modal.innerHTML = `
        <div style="background: white; 
                    padding: 2rem; 
                    border-radius: 10px; 
                    max-width: 500px; 
                    width: 90%; 
                    position: relative;">
            <button onclick="this.closest('div[style*=fixed]').remove()" 
                    style="position: absolute; 
                           top: 1rem; 
                           right: 1rem; 
                           background: none; 
                           border: none; 
                           font-size: 1.5rem; 
                           cursor: pointer;">×</button>
            <img src="${vehicle.image}" 
                 alt="${vehicle.name}" 
                 style="width: 100%; 
                        height: 300px; 
                        object-fit: cover; 
                        border-radius: 5px; 
                        margin-bottom: 1rem;">
            <h3 style="color: var(--primary-color); 
                       margin-bottom: 0.5rem;">${vehicle.name}</h3>
            <p style="color: var(--secondary-color); 
                      font-weight: bold; 
                      margin-bottom: 0.5rem;">${vehicle.price}</p>
            <p style="color: var(--text-color); 
                      margin-bottom: 1rem;">${vehicle.description}</p>
            <button onclick="showContactOptions()" class="primary-button" style="background-color:#2B4B8C;color:white;padding:0.75rem 2rem;border:none;border-radius:6px;cursor:pointer;font-size:1rem;">
                Contact Dealer
            </button>
        </div>
    `;

    document.body.appendChild(modal);
}

// Initialize all features when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    populateVehicles();
    setupMobileNav();
    setupSmoothScroll();
});

// --- Autoparts Brands Grid ---
const brands = [
  { name: 'Hero', icon: 'fa-motorcycle', logo: 'images/logos/hero-removebg-preview.png', models: [
    'Splendor Plus', 'HF Deluxe', 'Passion Pro / Passion Plus', 'Super Splendor', 'Glamour', 'Xtreme 160R', 'Xpulse 200', 'Karizma XMR', 'Xtreme 200S', 'Xtreme 125R', 'Xtreme 200T', 'CBZ Xtreme', 'Hunk', 'Achiever', 'Ignitor', 'iSmart 110', 'Splendor NXG', 'HF 100', 'Pleasure Plus', 'Destini 125', 'Maestro Edge 110', 'Maestro Edge 125'
  ] },
  {
    name: 'Bajaj',
    icon: 'fa-motorcycle',
    logo: 'images/logos/bajaj-removebg-preview.png',
    models: [
      'Pulsar 125', 'Pulsar 150', 'Pulsar NS200', 'Pulsar NS160', 'Pulsar N160', 'Pulsar N250', 'Pulsar RS200', 'Dominar 250', 'Dominar 400', 'Avenger 160', 'Avenger 220', 'CT100', 'CT110', 'Platina 100', 'Platina 110 H-Gear', 'Discover 125', 'Discover 150'
    ]
  },
  {
    name: 'TVS',
    icon: 'fa-motorcycle',
    logo: 'images/logos/tvs-removebg-preview.png',
    models: [
      'Sport', 'Star City Plus', 'Radeon', 'Apache RTR 160', 'Apache RTR 160 4V', 'Apache RTR 180', 'Apache RTR 200 4V', 'Apache RR 310', 'Raider 125', 'Ronin', 'XL100', 'Scooty Pep+', 'Zest 110', 'Jupiter 110', 'Jupiter 125', 'NTorq 125'
    ]
  },
  {
    name: 'Honda',
    icon: 'fa-motorcycle',
    logo: 'images/logos/honda-removebg-preview.png',
    models: [
      'Shine 100', 'Shine 125', 'SP 125', 'Unicorn', 'XBlade', 'Hornet 2.0', 'CB200X', 'CB300F', "CB350 H'ness", 'CB350 RS', 'Activa 6G', 'Activa 5G', 'Activa 4G', 'Activa 3G', 'Activa', 'Activa 125', 'Dio', 'Dio 125'
    ]
  },
  {
    name: 'Yamaha',
    icon: 'fa-motorcycle',
    logo: 'images/logos/yamaha-removebg-preview.png',
    models: [
      'FZ V3', 'FZ-S FI V4', 'FZ-X', 'R15 V4', 'R15M', 'MT-15 V2', 'FZ25', 'FZS25', 'Fascino 125', 'RayZR 125'
    ]
  },
  {
    name: 'KTM',
    icon: 'fa-motorcycle',
    logo: 'images/logos/ktm-removebg-preview.png',
    models: [
      'Duke 125', 'Duke 200', 'Duke 250', 'Duke 390', 'RC 125', 'RC 200', 'RC 390', '390 Adventure', '390 Adventure X'
    ]
  },
  {
    name: 'Suzuki',
    icon: 'fa-motorcycle',
    logo: 'images/logos/suzuki.jp-removebg-preview.png',
    models: [
      'Gixxer', 'Gixxer SF', 'Gixxer 250', 'Gixxer SF 250', 'Intruder 150', 'Access 125', 'Burgman Street 125', 'Avenis 125'
    ]
  },
  {
    name: 'Jawa / Yezdi',
    icon: 'fa-motorcycle',
    logo: 'images/logos/jawa-removebg-preview.png',
    models: [
      'Jawa 42', 'Jawa Classic', 'Jawa Perak', 'Jawa 350', 'Yezdi Roadster', 'Yezdi Scrambler', 'Yezdi Adventure'
    ]
  },
  {
    name: 'Kawasaki',
    icon: 'fa-motorcycle',
    logo: 'images/logos/kawasaki-removebg-preview.png',
    models: [
      'Ninja 300', 'Ninja 400', 'Ninja 650', 'Z650', 'Z900'
    ]
  },
  {
    name: 'Benelli',
    icon: 'fa-motorcycle',
    logo: 'images/logos/binilli-removebg-preview.png',
    models: [
      'Imperiale 400', 'TRK 502', 'Leoncino 250', '600i', '300i'
    ]
  },
  {
    name: 'Royal Enfield',
    icon: 'fa-motorcycle',
    logo: 'images/logos/royalenfield-removebg-preview.png',
    models: [
      'Bullet 350', 'Classic 350', 'Hunter 350', 'Meteor 350', 'Scram 411', 'Himalayan 450', 'Interceptor 650', 'Continental GT 650'
    ]
  },
  {
    name: 'Aprilia',
    icon: 'fa-motorcycle',
    logo: 'images/logos/aprilia-removebg-preview.png',
    models: [
      'SR 125', 'SR 160', 'SXR 125', 'SXR 160', 'RS 660', 'Tuono 660', 'RSV4 1100 Factory'
    ]
  },
  {
    name: 'Harley-Davidson',
    icon: 'fa-motorcycle',
    logo: 'images/logos/harley-removebg-preview.png',
    models: [
      'X440', 'Iron 883', 'Forty-Eight', 'Nightster', 'Street Bob 114', 'Fat Bob 114', 'Fat Boy 114', 'Heritage Classic', 'Street Glide', 'Road Glide'
    ]
  },
  {
    name: 'BMW',
    icon: 'fa-motorcycle',
    logo: 'images/logos/bmw-removebg-preview.png',
    models: [
      'G310R', 'G310GS', 'F900R', 'F900XR', 'R1250GS', 'S1000RR', 'R18'
    ]
  },
  {
    name: 'Ducati',
    icon: 'fa-motorcycle',
    logo: 'images/logos/ducati-removebg-preview.png',
    models: [
      'Monster', 'Hypermotard 950', 'Scrambler Icon', 'Scrambler 1100', 'Multistrada V4', 'Diavel 1260', 'Panigale V2', 'Panigale V4', 'Streetfighter V2', 'Streetfighter V4'
    ]
  }
];

const partCategories = [
  { name: 'Engine Parts', parts: [
    'Cylinder Kit / Block', 'Piston & Rings', 'Valve Set (Inlet & Exhaust)', 'Valve Seal', 'Engine Head',
    'Camshaft / Timing Chain / Timing Belt', 'Crankshaft', 'Connecting Rod', 'Gudgeon Pin / Wrist Pin',
    'Timing Sprockets / Roller Weights', 'Magnet Assembly / Magnet Coil', 'CVT Belt / Drive Belt',
    'Variator Pulley Set / Fan Pulley', 'Engine Oil Seal Kit', 'Engine Gasket Kit', 'Oil Pump',
    'Kick Shaft / Kick Spindle', 'Gear Set', 'Valve Guide / Stem Seal', 'Spark Plug'
  ] },
  { name: 'Clutch & CVT / Transmission', parts: [
    'Clutch Plate Set', 'Clutch Bell / Basket', 'Pressure Plate', 'Clutch Centre', 'Clutch Shoe',
    'Clutch Spring', 'Clutch Cable / Wire', 'Clutch Assembly (Complete)', 'Variator Set',
    'CVT Pulley / Clutch Pulley', 'Roller Weights', 'Pulley Bush', 'Kick Start Gear Set',
    'Gear Lever', 'Chain Sprocket Kit', 'Front Sprocket / Rear Sprocket', 'Drive Chain',
    'Kick Lever', 'Kick Spring', 'CVT Case Cover', 'Gearbox Oil'
  ] },
  { name: 'Cables & Levers', parts: [
    'Clutch Cable', 'Front Brake Cable', 'Rear Brake Cable', 'Throttle / Accelerator Cable',
    'Choke Cable', 'Speedometer Cable', 'Tachometer Cable', 'Lever Set (Clutch / Brake)',
    'Lever Adjuster', 'Gear Lever', 'Handlebar Grip Set'
  ] },
  { name: 'Brakes', parts: [
    'Front Disc Rotor', 'Brake Pads (Disc)', 'Brake Shoes (Drum)', 'Rear Drum Plate / Rear Brake Assembly',
    'Master Cylinder (Front/Rear)', 'Caliper Assembly', 'Caliper Piston / Seal Kit',
    'Brake Cam / Rod / Spring', 'Brake Lever Assembly', 'Brake Switch / Sensor',
    'Brake Oil Reservoir', 'Brake Oil Hose / Line'
  ] },
  { name: 'Suspension & Steering', parts: [
    'Front Fork / Fork Pipe', 'Rear Suspension (Mono/Dual)', 'Shock Absorber (Scooter/Bike)',
    'Steering Cone Set', 'T-Set / Triple Tree / Yoke Set', 'Handlebar', 'Fork Oil Seal Kit',
    'Swing Arm Bush Kit / Suspension Bush', 'Steering Bearing Kit', 'Steering Lock'
  ] },
  { name: 'Electrical & Lighting', parts: [
    'Headlight Assembly', 'Tail Light Assembly', 'Indicator Lights', 'Speedometer / Odometer (Analog / Digital)',
    'Battery', 'Horn', 'Ignition Switch / Key Set', 'CDI Unit', 'Regulator / Rectifier',
    'Starter Motor', 'Relay & Flasher Unit', 'Magnet Coil / Stator', 'Handlebar Switch Assembly (L/R)',
    'Brake Light Switch', 'Spark Plug Coil', 'Wiring Harness'
  ] },
  { name: 'Body Panels & Exterior', parts: [
    'Headlight Visor / Dome', 'Front Nose Panel (Scooter)', 'Chest Panel / Apron (Scooter)',
    'Side Panels / Side Covers', 'Front Mudguard', 'Rear Mudguard', 'Footboard / Floor Mat (Scooter)',
    'Fuel Tank', 'Fuel Cap / Tank Cap', 'Seat Assembly', 'Seat Lock', 'Tool Box / Side Box / Glove Box',
    'Saree Guard', 'Grab Rail', 'Number Plate Frame', 'Chain Cover', 'Tail Panel',
    'Leg Guard / Crash Guard', 'Mirror Set'
  ] },
  { name: 'Tyres & Wheels', parts: [
    'Front Tyre', 'Rear Tyre', 'Tube / Tubeless Valve', 'Alloy Wheels', 'Spoke Wheels / Rim Set',
    'Wheel Bearings', 'Axle / Spindle', 'Sprocket Hub / Rear Drum', 'Rim Locks'
  ] },
  { name: 'Accessories & Add-ons', parts: [
    'Mobile Holder / USB Charger', 'Handlebar Riser', 'Side Stand / Main Stand',
    'Footrest Assembly / Ladies Footrest', 'Windshield / Visor', 'Seat Cover',
    'Tank Cover / Tank Pad', 'Bike/Scooter Cover', 'Fog Lights / Auxiliary Lights',
    'Crash Guard', 'Luggage Carrier / Saddle Stay', 'Extra Storage Box (Front/Rear - Scooter)',
    'Backrest / Pillion Support', 'Buzzer / Reverse Horn'
  ] }
];

// List of all scooter models (across brands)
const scooterModels = [
  // Hero
  'Pleasure Plus', 'Destini 125', 'Maestro Edge 110', 'Maestro Edge 125',
  // TVS
  'Scooty Pep+', 'Zest 110', 'Jupiter 110', 'Jupiter 125', 'NTorq 125', 'XL100',
  // Honda
  'Activa 6G', 'Activa 5G', 'Activa 4G', 'Activa 3G', 'Activa', 'Activa 125', 'Dio', 'Dio 125',
  // Yamaha
  'Fascino 125', 'RayZR 125',
  // Suzuki
  'Access 125', 'Burgman Street 125', 'Avenis 125',
  // Aprilia
  'SR 125', 'SR 160', 'SXR 125', 'SXR 160'
];

// Scooter-specific part categories and parts
const scooterPartCategories = [
  { name: 'Engine Parts', parts: [
    'Cylinder Kit / Block', 'Piston & Rings', 'Valve Set (Inlet & Exhaust)', 'Valve Seal', 'Engine Head',
    'Camshaft / Timing Chain / Timing Belt', 'Crankshaft', 'Connecting Rod', 'Gudgeon Pin / Wrist Pin',
    'Timing Sprockets / Roller Weights', 'Magnet Assembly / Magnet Coil', 'CVT Belt / Drive Belt',
    'Variator Pulley Set / Fan Pulley', 'Engine Oil Seal Kit', 'Engine Gasket Kit', 'Oil Pump',
    'Kick Shaft / Kick Spindle', 'Gear Set', 'Valve Guide / Stem Seal', 'Spark Plug'
  ] },
  { name: 'Clutch & CVT / Transmission', parts: [
    'CVT Belt (Fan Belt)', 'Clutch Shoe', 'Clutch Bell / Basket', 'Variator Set', 'Kick Shaft & Spring',
    'Gear Oil', 'Drive Face / Ramp Plate', 'Driven Pulley', 'Roller Set', 'CVT Housing',
    'CVT Cover Gasket', 'CVT Air Filter', 'Belt Housing', 'Torque Spring', 'Clutch Weight Set',
    'Drive Belt Cover', 'Transmission Case', 'Final Drive Gear', 'Drive Shaft', 'Driven Shaft',
    'CVT Cooling Fan', 'Belt Tensioner', 'CVT Bearing Set'
  ] },
  { name: 'Cables & Levers', parts: [
    'Throttle Cable', 'Front Brake Cable', 'Rear Brake Cable', 'Choke Cable',
    'Speedometer Cable', 'Lever Set (Front/Rear Brake)', 'Lever Adjuster',
    'Handlebar Grip Set', 'Cable End Set', 'Cable Guide Set'
  ] },
  { name: 'Brakes', parts: [
    'Front Brake Shoe/Disc Pad', 'Rear Brake Shoe', 'Brake Cam Lever', 'Brake Switch',
    'Master Cylinder (if disc)', 'Brake Lever (RH & LH)', 'Brake Cable', 'Brake Drum',
    'Brake Panel', 'Brake Spring Set', 'Brake Cam', 'Brake Fluid DOT3/DOT4', 'Brake Hose',
    'Brake Caliper', 'Brake Disc', 'Brake Pad Pin Set', 'Master Cylinder Repair Kit',
    'Caliper Repair Kit', 'Brake Light Switch', 'Brake Mounting Kit'
  ] },
  { name: 'Suspension & Steering', parts: [
    'Front Fork / Fork Pipe', 'Rear Shock Absorber', 'Suspension Bush Kit', 'Fork Oil Seal',
    'Fork Dust Seal', 'Front Fork Assembly', 'Fork Spring', 'Fork Oil', 'Steering Stem Bearing',
    'Steering Race Set', 'Fork Bottom Case', 'Fork Top Bridge', 'Suspension Linkage Kit',
    'Fork Protector', 'Fork Cap Set', 'Fork Drain Bolt', 'Shock Absorber Bush', 'Progressive Spring Kit'
  ] },
  { name: 'Electrical & Lighting', parts: [
    'Headlight Assembly', 'Tail Light Assembly', 'Indicator Lights', 'Speedometer / Odometer (Analog / Digital)',
    'Battery', 'Horn', 'Ignition Switch / Key Set', 'CDI Unit', 'Regulator / Rectifier',
    'Starter Motor', 'Relay & Flasher Unit', 'Magnet Coil / Stator', 'Handlebar Switch Assembly (L/R)',
    'Brake Light Switch', 'Spark Plug Coil', 'Wiring Harness'
  ] },
  { name: 'Body Panels & Exterior', parts: [
    'Front Panel (Chest)', 'Nose Panel (Headlight Mask)', 'Side Panels', 'Floor Board',
    'Mudguard (Front & Rear)', 'Handle Cover', 'Tail Panel', 'Glove Box', 'Seat Assembly',
    'Grab Rail', 'Footrest', 'Front Fairing', 'Rear Cowl', 'Center Cover', 'Under Cover',
    'Leg Shield', 'Body Cover', 'Visor', 'Mirror Set', 'Number Plate Holder'
  ] },
  { name: 'Tyres & Wheels', parts: [
    'Front Tyre', 'Rear Tyre', 'Alloy Wheels', 'Tube / Tubeless Valve', 'Rim Strip',
    'Wheel Bearings', 'Wheel Hub', 'Wheel Spacer', 'Axle / Spindle', 'Axle Nut',
    'Wheel Weight', 'Tyre Sealant', 'Tubeless Tyre Kit', 'Rim Lock', 'Rim Tape'
  ] },
  { name: 'Accessories & Add-ons', parts: [
    'Side Stand', 'Main Stand', 'Lock Set', 'Key Set', 'Mirror Set', 'Foot Mat',
    'Indicator Buzzer', 'Number Plate Frame', 'Tool Kit', 'Luggage Box',
    'Mobile Phone Holder', 'USB Charger', 'Seat Cover', 'Body Cover', 'Floor Mat',
    'Storage Hook', 'Helmet Lock', 'Security Alarm', 'Crash Guard', 'Visor Extension'
  ] }
];

function renderBrandGrid() {
  const brandStep = document.getElementById('brand-step');
  if (!brandStep) return;
  brandStep.innerHTML = '';
  // Add heading
  const heading = document.createElement('h2');
  heading.className = 'section-title';
  heading.textContent = 'Select Your Bike Brand';
  brandStep.appendChild(heading);
  // Brand grid
  const grid = document.createElement('div');
  grid.className = 'brand-grid';
  brands.forEach((brand, idx) => {
    const card = document.createElement('div');
    card.className = 'brand-card';
    card.innerHTML = `<img src="${brand.logo}" alt="${brand.name} logo" class="brand-logo" onerror="this.style.display='none';this.parentNode.querySelector('i').style.display='block';"/><i class='fas ${brand.icon}' style='display:none;'></i><span>${brand.name}</span><br><a href="#" class="brand-link" style="display:inline-block;margin-top:0.7rem;color:var(--primary-blue);font-weight:600;text-decoration:underline;font-size:1.05rem;">${brand.name} BikeAutoParts &rarr;</a>`;
    // Brand link click: show full parts gallery for this brand
    card.querySelector('.brand-link').onclick = (e) => {
      e.preventDefault();
      renderModelGridFromCatalog(brand.name);
    };
    // Card click: show models as before
    card.onclick = (e) => {
      if (e.target.classList.contains('brand-link')) return;
      renderModelGridFromCatalog(brand.name);
    };
    grid.appendChild(card);
  });
  brandStep.appendChild(grid);
  brandStep.style.display = 'block';
  document.getElementById('model-step').style.display = 'none';
  document.getElementById('parts-step').style.display = 'none';
  document.getElementById('part-listing-step').style.display = 'none';
}

function renderModelGridFromCatalog(brandName) {
  const modelStep = document.getElementById('model-step');
  const brandStep = document.getElementById('brand-step');
  modelStep.innerHTML = '';
  // Get models from the brands array
  const brandObj = brands.find(b => b.name === brandName);
  const models = brandObj ? brandObj.models : [];
  const backBtn = document.createElement('button');
  backBtn.textContent = '← Back to Brands';
  backBtn.className = 'back-btn';
  backBtn.onclick = () => renderBrandGrid();
  modelStep.appendChild(backBtn);
  const title = document.createElement('h3');
  title.textContent = `Select Model for ${brandName}`;
  modelStep.appendChild(title);
  const grid = document.createElement('div');
  grid.className = 'model-grid';

  // Hero model images from BikeWale
  const heroModelImages = {
    'Splendor Plus': 'https://imgd.aeplcdn.com/664x374/bw/models/hero-splendor-plus-xtec-right-side-view.png',
    'HF Deluxe': 'https://imgd.aeplcdn.com/664x374/bw/models/hero-hf-deluxe-right-side-view.png',
    'Passion Pro / Passion Plus': 'https://imgd.aeplcdn.com/664x374/bw/models/hero-passion-plus-right-side-view.png',
    'Super Splendor': 'https://imgd.aeplcdn.com/664x374/bw/models/hero-super-splendor-xtec-right-side-view.png',
    'Glamour': 'https://imgd.aeplcdn.com/664x374/bw/models/hero-glamour-xtec-right-side-view.png',
    'Xtreme 160R': 'https://imgd.aeplcdn.com/664x374/bw/models/hero-xtreme-160r-4v-right-side-view.png',
    'Xpulse 200': 'https://imgd.aeplcdn.com/664x374/bw/models/hero-xpulse-200-4v-right-side-view.png',
    'Karizma XMR': 'https://imgd.aeplcdn.com/664x374/bw/models/hero-karizma-xmr-right-side-view.png',
    'Xtreme 200S': 'https://imgd.aeplcdn.com/664x374/bw/models/hero-xtreme-200s-4v-right-side-view.png',
    'Xtreme 125R': 'https://imgd.aeplcdn.com/664x374/bw/models/hero-xtreme-125r-right-side-view.png',
    'Xtreme 200T': 'https://imgd.aeplcdn.com/664x374/bw/models/hero-xtreme-200t-4v-right-side-view.png',
    'CBZ Xtreme': 'https://imgd.aeplcdn.com/664x374/bw/models/hero-cbz-xtreme-right-side-view.png',
    'Hunk': 'https://imgd.aeplcdn.com/664x374/bw/models/hero-hunk-right-side-view.png',
    'Achiever': 'https://imgd.aeplcdn.com/664x374/bw/models/hero-achiever-150-right-side-view.png',
    'Ignitor': 'https://imgd.aeplcdn.com/664x374/bw/models/hero-ignitor-right-side-view.png',
    'iSmart 110': 'https://imgd.aeplcdn.com/664x374/bw/models/hero-splendor-ismart-110-right-side-view.png',
    'Splendor NXG': 'https://imgd.aeplcdn.com/664x374/bw/models/hero-splendor-nxg-right-side-view.png',
    'HF 100': 'https://imgd.aeplcdn.com/664x374/bw/models/hero-hf-100-right-side-view.png',
    'Pleasure Plus': 'https://imgd.aeplcdn.com/664x374/bw/models/hero-pleasure-plus-right-side-view.png',
    'Destini 125': 'https://imgd.aeplcdn.com/664x374/bw/models/hero-destini-125-right-side-view.png',
    'Maestro Edge 110': 'https://imgd.aeplcdn.com/664x374/bw/models/hero-maestro-edge-110-right-side-view.png',
    'Maestro Edge 125': 'https://imgd.aeplcdn.com/664x374/bw/models/hero-maestro-edge-125-right-side-view.png',
  };

  models.forEach(model => {
    const card = document.createElement('div');
    card.className = 'model-card';
    if (brandName === 'Hero' && heroModelImages[model]) {
      card.innerHTML = `<img src="${heroModelImages[model]}" alt="${model}" style="width:80px;height:auto;display:block;margin:0 auto 8px auto;object-fit:contain;"><span>${model}</span>`;
    } else {
      card.innerHTML = `<span>${model}</span>`;
    }
    card.onclick = () => renderPartsStepFromCatalog(brandName, model);
    grid.appendChild(card);
  });
  modelStep.appendChild(grid);
  brandStep.style.display = 'none';
  modelStep.style.display = 'block';
  document.getElementById('parts-step').style.display = 'none';
  document.getElementById('part-listing-step').style.display = 'none';
}

function renderPartsStepFromCatalog(brandName, model) {
  const partsStep = document.getElementById('parts-step');
  const modelStep = document.getElementById('model-step');
  partsStep.innerHTML = '';
  // Use scooterPartCategories if model is a scooter, else use partCategories
  const isScooter = scooterModels.includes(model);
  const categories = isScooter
    ? scooterPartCategories.map(cat => cat.name)
    : partCategories.map(cat => cat.name);
  const backBtn = document.createElement('button');
  backBtn.textContent = '← Back to Models';
  backBtn.className = 'back-btn';
  backBtn.onclick = () => renderModelGridFromCatalog(brandName);
  partsStep.appendChild(backBtn);
  const title = document.createElement('h3');
  title.textContent = `Select Part Category for ${model}`;
  partsStep.appendChild(title);
  const catGrid = document.createElement('div');
  catGrid.className = 'model-grid';
  categories.forEach(cat => {
    const catCard = document.createElement('div');
    catCard.className = 'model-card';
    catCard.innerHTML = `<span>${cat}</span>`;
    catCard.onclick = () => renderPartsListFromCatalog(brandName, model, cat);
    catGrid.appendChild(catCard);
  });
  partsStep.appendChild(catGrid);
  modelStep.style.display = 'none';
  partsStep.style.display = 'block';
  document.getElementById('part-listing-step').style.display = 'none';
}

function renderPartsListFromCatalog(brandName, model, category) {
  const partsStep = document.getElementById('parts-step');
  const partListingStep = document.getElementById('part-listing-step');
  
  // Clear both steps
  partsStep.innerHTML = '';
  partListingStep.style.display = 'none';
  
  const backBtn = document.createElement('button');
  backBtn.textContent = '← Back to Categories';
  backBtn.className = 'back-btn';
  backBtn.onclick = () => renderPartsStepFromCatalog(brandName, model);
  partsStep.appendChild(backBtn);
  
  const title = document.createElement('h3');
  title.textContent = `${category} Parts for ${model}`;
  partsStep.appendChild(title);
  
  const list = document.createElement('div');
  list.className = 'model-grid';
  
  // Use scooterPartCategories if model is a scooter, else use partCategories
  const isScooter = scooterModels.includes(model);
  const catObj = isScooter
    ? scooterPartCategories.find(cat => cat.name === category)
    : partCategories.find(cat => cat.name === category);
  
  const parts = catObj ? catObj.parts : [];
  parts.forEach(part => {
    const partCard = document.createElement('div');
    partCard.className = 'model-card';
    partCard.innerHTML = `
      <span>${part}</span>
      <button class='primary-button' 
              style='margin-top:0.7rem;font-size:0.95rem;' 
              onclick='openEnquiryModal("${brandName}", "${model}", "${category}", "${part}")'>
        Enquire Now
      </button>`;
    list.appendChild(partCard);
  });
  
  partsStep.appendChild(list);
  partsStep.style.display = 'block';
}

function openEnquiryModal(brand, model, category, part) {
  const modal = document.getElementById('enquiry-modal');
  modal.innerHTML = `<div style='background:#fff;padding:2rem 1.5rem;border-radius:12px;max-width:400px;margin:5vh auto;box-shadow:0 4px 24px rgba(43,75,140,0.18);position:relative;'>
    <button onclick='closeEnquiryModal()' style='position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:1.5rem;cursor:pointer;'>&times;</button>
    <h3 style='color:var(--primary-blue);margin-bottom:1rem;'>Enquire for ${part}</h3>
    <form id='enquiry-form'>
      <input type='text' name='name' placeholder='Your Name' required style='width:100%;margin-bottom:1rem;padding:0.6rem;border-radius:6px;border:1.2px solid var(--primary-blue);'>
      <input type='tel' name='phone' placeholder='Phone Number' required style='width:100%;margin-bottom:1rem;padding:0.6rem;border-radius:6px;border:1.2px solid var(--primary-blue);'>
      <input type='text' name='city' value='Agra' readonly style='width:100%;margin-bottom:1rem;padding:0.6rem;border-radius:6px;border:1.2px solid var(--primary-blue);background:#f7f7f7;'>
      <textarea name='query' placeholder='Your Query (optional)' style='width:100%;margin-bottom:1rem;padding:0.6rem;border-radius:6px;border:1.2px solid var(--primary-blue);'></textarea>
      <input type='hidden' name='brand' value='${brand}'>
      <input type='hidden' name='model' value='${model}'>
      <input type='hidden' name='category' value='${category}'>
      <input type='hidden' name='part' value='${part}'>
      <button type='submit' class='primary-button' style='width:100%;'>Send Enquiry</button>
    </form>
  </div>`;
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  document.getElementById('enquiry-form').onsubmit = function(e) {
    e.preventDefault();
    modal.innerHTML = `<div style='padding:2rem;text-align:center;'><h3 style='color:var(--primary-blue);'>Thank you!</h3><p>Your enquiry has been submitted.<br>We will contact you soon.</p><button class='primary-button' onclick='closeEnquiryModal()' style='margin-top:1.5rem;'>Close</button></div>`;
  };
}

function closeEnquiryModal() {
  const modal = document.getElementById('enquiry-modal');
  modal.style.display = 'none';
  modal.innerHTML = '';
  document.body.style.overflow = '';
}

// --- Global Search Bar for Parts ---
function setupGlobalPartSearch() {
  const searchInput = document.getElementById('part-search');
  if (!searchInput) return;
  searchInput.placeholder = 'Search parts, brands, models, or categories...';
  searchInput.addEventListener('input', function() {
    const q = this.value.trim().toLowerCase();
    const partStep = document.getElementById('part-listing-step');
    if (!q) {
      renderBrandGrid();
      document.getElementById('model-step').style.display = 'none';
      document.getElementById('parts-step').style.display = 'none';
      partStep.style.display = 'none';
      return;
    }
    // Search in catalog
    let found = false;
    partStep.innerHTML = '';
    Object.entries(autopartsCatalog).forEach(([brand, models]) => {
      Object.entries(models).forEach(([model, categories]) => {
        Object.entries(categories).forEach(([cat, parts]) => {
          parts.forEach(part => {
            if (
              brand.toLowerCase().includes(q) ||
              model.toLowerCase().includes(q) ||
              cat.toLowerCase().includes(q) ||
              part.toLowerCase().includes(q)
            ) {
              if (!found) {
                partStep.innerHTML = `<h3>Search Results</h3>`;
                found = true;
              }
              const card = document.createElement('div');
              card.className = 'model-card';
              card.innerHTML = `<b>${brand}</b> / <b>${model}</b> / <b>${cat}</b><br><span>${part}</span><button class='primary-button' style='margin-top:0.7rem;font-size:0.95rem;' onclick='openEnquiryModal("${brand}", "${model}", "${cat}", "${part}")'>Enquire Now</button>`;
              partStep.appendChild(card);
            }
          });
        });
      });
    });
    document.getElementById('brand-step').style.display = 'none';
    document.getElementById('model-step').style.display = 'none';
    document.getElementById('parts-step').style.display = 'none';
    partStep.style.display = 'block';
    if (!found) {
      partStep.innerHTML = `<p style='text-align:center;color:var(--primary-blue);margin-top:2rem;'>No results found.</p>`;
    }
  });
}

// On DOMContentLoaded, setup the new logic
window.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  if (path.endsWith('autoparts.html')) {
    renderBrandGrid();
    setupGlobalPartSearch();
    if (document.getElementById('cart-icon')) {
      document.getElementById('cart-icon').onclick = showCartModal;
      document.getElementById('cart-count').textContent = getCart().reduce((a, b) => a + b.quantity, 0);
    }
    return;
  }
  if (path.endsWith('servicing.html')) {
    renderBrandGridFor('servicing-brand-step');
  } else if (path.endsWith('repairing.html')) {
    renderBrandGridFor('repairing-brand-step');
  } else if (path.endsWith('restoring.html')) {
    renderBrandGridFor('restoring-brand-step');
  } else if (path.endsWith('painting.html')) {
    renderBrandGridFor('painting-brand-step');
  } else if (path.endsWith('sale.html')) {
    renderBrandGridFor('sale-brand-step');
  }
});

function renderBrandGridFor(targetDivId, onBrandClick) {
  const brandStep = document.getElementById(targetDivId);
  if (!brandStep) return;
  brandStep.innerHTML = '';
  // Add heading
  const heading = document.createElement('h2');
  heading.className = 'section-title';
  heading.textContent = 'Select Your Bike Brand';
  brandStep.appendChild(heading);
  // Brand grid
  const grid = document.createElement('div');
  grid.className = 'brand-grid';
  brands.forEach((brand, idx) => {
    const card = document.createElement('div');
    card.className = 'brand-card';
    card.innerHTML = `<img src="${brand.logo}" alt="${brand.name} logo" class="brand-logo" onerror="this.style.display='none';this.parentNode.querySelector('i').style.display='block';"/><i class='fas ${brand.icon}' style='display:none;'></i><span>${brand.name}</span>`;
    card.onclick = () => onBrandClick ? onBrandClick(idx) : null;
    grid.appendChild(card);
  });
  brandStep.appendChild(grid);
}

// --- Sale & Purchase Logic ---
function getBikes() {
  return JSON.parse(localStorage.getItem('bikes') || '[]');
}
function saveBikes(bikes) {
  localStorage.setItem('bikes', JSON.stringify(bikes));
}
function renderBikeListings() {
  if (window.location.pathname.endsWith('sale.html')) {
    // sale.html manages its own live Supabase bike listings
    return;
  }
  const grid = document.querySelector('.bike-listings-grid');
  if (!grid) return;
  let bikes = getBikes();
  // Apply filters
  const brand = document.getElementById('filter-brand')?.value || '';
  const model = document.getElementById('filter-model')?.value || '';
  const price = document.getElementById('filter-price')?.value || '';
  if (brand) bikes = bikes.filter(b => b.brand === brand);
  if (model) bikes = bikes.filter(b => b.model === model);
  if (price) {
    const [min, max] = price.split('-').map(Number);
    bikes = bikes.filter(b => b.price >= min && b.price <= max);
  }
  grid.innerHTML = '';
  if (!bikes.length) {
    grid.innerHTML = `<p style='text-align:center;color:var(--primary-blue);margin-top:2rem;'>No bikes found.</p>`;
    return;
  }
  bikes.forEach((bike, idx) => {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.innerHTML = `
      <h3>${bike.brand} ${bike.model}</h3>
      <p><b>Year:</b> ${bike.year} | <b>Condition:</b> ${bike.condition}</p>
      <p><b>Price:</b> ₹${bike.price.toLocaleString()}</p>
      <button class='primary-button' onclick='openSaleContactModal(${idx})'>I'm Interested</button>
    `;
    grid.appendChild(card);
  });
}
function updateModelFilter() {
  const bikes = getBikes();
  const brand = document.getElementById('filter-brand')?.value || '';
  const modelSel = document.getElementById('filter-model');
  if (!modelSel) return;
  const models = [...new Set(bikes.filter(b => !brand || b.brand === brand).map(b => b.model))];
  modelSel.innerHTML = '<option value="">All Models</option>' + models.map(m => `<option>${m}</option>`).join('');
}
function setupSaleFilters() {
  const brandSel = document.getElementById('filter-brand');
  const modelSel = document.getElementById('filter-model');
  const priceSel = document.getElementById('filter-price');
  [brandSel, modelSel, priceSel].forEach(sel => sel && sel.addEventListener('change', () => {
    if (sel === brandSel) updateModelFilter();
    renderBikeListings();
  }));
}
function setupBikeUploadForm() {
  const form = document.getElementById('bike-upload-form');
  if (!form) return;
  form.onsubmit = function(e) {
    e.preventDefault();
    const formData = new FormData(form);
    // Handle photos
    const photos = formData.getAll('photos');
    const photoFiles = document.getElementById('bike-photos').files;
    if (photoFiles.length > 5) {
      alert('You can upload up to 5 photos only.');
      return;
    }
    // Handle videos
    const videoFiles = document.getElementById('bike-videos').files;
    if (videoFiles.length > 2) {
      alert('You can upload up to 2 videos only.');
      return;
    }
    const data = Object.fromEntries(formData.entries());
    data.price = Number(data.price);
    // Save file names (not actual files)
    data.photos = Array.from(photoFiles).map(f => f.name);
    data.videos = Array.from(videoFiles).map(f => f.name);
    let bikes = getBikes();
    bikes.push(data);
    saveBikes(bikes);
    form.reset();
    document.getElementById('bike-upload-success').textContent = 'Bike listed successfully!';
    document.getElementById('bike-upload-success').style.display = 'block';
    renderBikeListings();
    updateModelFilter();
    setTimeout(() => { document.getElementById('bike-upload-success').style.display = 'none'; }, 2500);
  };
}
function openSaleContactModal(idx) {
  const bikes = getBikes();
  const bike = bikes[idx];
  const modal = document.getElementById('sale-contact-modal');
  const content = document.getElementById('bike-details-content');
  
  // Format price with commas for Indian numbering system
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(bike.price);

  content.innerHTML = `
    <div style="text-align:center;margin-bottom:2rem;">
        <img src="${bike.image_url || '../images/logoo neww.png'}" 
             alt="${bike.brand} ${bike.model}" 
             style="max-width:100%;max-height:400px;object-fit:contain;border-radius:8px;">
    </div>
    <h2 style="color:var(--primary-blue);margin-bottom:1rem;">${bike.brand} ${bike.model}</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:1.5rem;margin-bottom:1.5rem;">
        <div>
            <h4 style="color:#666;margin-bottom:0.5rem;">Price</h4>
            <p style="font-size:1.2rem;font-weight:500;">${formattedPrice}</p>
        </div>
        <div>
            <h4 style="color:#666;margin-bottom:0.5rem;">Year</h4>
            <p>${bike.year}</p>
        </div>
        <div>
            <h4 style="color:#666;margin-bottom:0.5rem;">Condition</h4>
            <p>${bike.condition || 'Not specified'}</p>
        </div>
    </div>
    <div>
        <h4 style="color:#666;margin-bottom:0.5rem;">Description</h4>
        <p style="line-height:1.6;">${bike.description || 'No description available'}</p>
    </div>
    <div style="text-align:center;margin-top:2rem;">
        <button onclick="showContactOptions()" class="primary-button" style="background-color:#2B4B8C;color:white;padding:0.75rem 2rem;border:none;border-radius:6px;cursor:pointer;font-size:1rem;">
            Contact Dealer
        </button>
    </div>
  `;
  
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
}
function closeContactModal() {
  const modal = document.getElementById('sale-contact-modal');
  modal.style.display = 'none';
  document.body.style.overflow = ''; // Restore scrolling
}
function contactDealer() {
  const dealerPhone = '+91 7310542113';
  window.location.href = `tel:${dealerPhone}`;
}
// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('sale-contact-modal');
  if (event.target === modal) {
    closeContactModal();
  }
}

// --- Autoparts Catalog & Cart Logic ---
const autopartsCatalog = [
  {
    brand: 'Hero',
    models: [
      {
        name: 'Splendor',
        parts: [
          { name: 'Air Filter', price: 280, img: 'https://imgd.aeplcdn.com/664x374/bw/models/hero-splendor-plus-xtec-right-front-three-quarter-2.png', category: 'Engine' },
          { name: 'Clutch Plate', price: 350, img: 'https://5.imimg.com/data5/SELLER/Default/2022/7/UK/GL/GL/1517266/hero-splendor-clutch-plate-set-500x500.jpg', category: 'Clutch' },
          { name: 'Cylinder Block Kit', price: 3100, img: 'https://5.imimg.com/data5/SELLER/Default/2022/7/UK/GL/GL/1517266/hero-cylinder-block-kit-500x500.jpg', category: 'Engine' }
        ]
      },
      {
        name: 'HF Deluxe',
        parts: [
          { name: 'Air Filter', price: 280, img: 'https://imgd.aeplcdn.com/664x374/bw/models/hero-hf-deluxe-right-front-three-quarter-2.png', category: 'Engine' },
          { name: 'Clutch Plate', price: 340, img: 'https://5.imimg.com/data5/SELLER/Default/2022/7/UK/GL/GL/1517266/hero-splendor-clutch-plate-set-500x500.jpg', category: 'Clutch' }
        ]
      }
    ]
  },
  {
    brand: 'Honda',
    models: [
      {
        name: 'Activa',
        parts: [
          { name: 'Air Filter', price: 230, img: 'https://imgd.aeplcdn.com/664x374/bw/models/honda-activa-6g-right-front-three-quarter-2.png', category: 'Engine' },
          { name: 'Clutch Plate', price: 360, img: 'https://5.imimg.com/data5/SELLER/Default/2022/7/UK/GL/GL/1517266/honda-activa-clutch-plate-set-500x500.jpg', category: 'Clutch' }
        ]
      }
    ]
  }
  // ... Add more brands/models/parts as needed
];

function renderPartListing(brandIdx, modelIdx) {
  const partStep = document.getElementById('part-listing-step');
  partStep.innerHTML = '';
  const brand = autopartsCatalog[brandIdx];
  const model = brand.models[modelIdx];
  // Back button
  const backBtn = document.createElement('button');
  backBtn.textContent = '← Back to Models';
  backBtn.className = 'back-btn';
  backBtn.onclick = () => renderPartsStep(brandIdx, model.name);
  partStep.appendChild(backBtn);
  // Title
  const title = document.createElement('h3');
  title.textContent = `Parts for ${brand.brand} ${model.name}`;
  partStep.appendChild(title);
  // Part grid
  const grid = document.createElement('div');
  grid.className = 'model-grid';
  model.parts.forEach((part, pIdx) => {
    const card = document.createElement('div');
    card.className = 'model-card';
    card.innerHTML = `
      <img src="${part.img}" alt="${part.name}" style="width:80px;height:80px;object-fit:contain;margin-bottom:0.5rem;">
      <span style="font-weight:700;">${part.name}</span>
      <span style="color:var(--primary-blue);font-size:1.1rem;font-weight:600;margin:0.5rem 0;">₹${part.price}</span>
      <div class="button-group">
        <button class="secondary-button" onclick="addToCart('${brand.brand}', '${part.name}', '${part.category}', ${part.price}, '${part.img}')">ADD TO CART</button>
        <button class="primary-button" onclick="window.open('https://wa.me/917310542113?text=I am interested in ${brand.brand} ${part.name} (${part.category}) - ₹${part.price}')">BUY NOW</button>
      </div>
    `;
    grid.appendChild(card);
  });
  partStep.appendChild(grid);
  document.getElementById('brand-step').style.display = 'none';
  document.getElementById('model-step').style.display = 'none';
  document.getElementById('parts-step').style.display = 'none';
  partStep.style.display = 'block';
}

function updateCartQty(brandIdx, modelIdx, pIdx, delta) {
  const input = document.getElementById(`qty-${brandIdx}-${modelIdx}-${pIdx}`);
  let val = parseInt(input.value) || 1;
  val = Math.max(1, val + delta);
  input.value = val;
}

function getCart() {
  return JSON.parse(localStorage.getItem('autoparts_cart') || '[]');
}
function saveCart(cart) {
  localStorage.setItem('autoparts_cart', JSON.stringify(cart));
  document.getElementById('cart-count').textContent = cart.reduce((a, b) => a + b.quantity, 0);
}

// Cart icon click
if (document.getElementById('cart-icon')) {
  document.getElementById('cart-icon').onclick = showCartModal;
  document.getElementById('cart-count').textContent = getCart().reduce((a, b) => a + b.quantity, 0);
}

// --- Brand Models Catalog Data (2024–2025) ---
const brandModelsCatalog = [
  {
    brand: 'Hero',
    models: [
      'Splendor Plus', 'HF Deluxe', 'Passion Pro / Passion Plus', 'Super Splendor', 'Glamour', 'Xtreme 160R', 'Xpulse 200', 'Karizma XMR', 'Xtreme 200S', 'Xtreme 125R', 'Xtreme 200T', 'CBZ Xtreme', 'Hunk', 'Achiever', 'Ignitor', 'iSmart 110', 'Splendor NXG', 'HF 100', 'Pleasure Plus', 'Destini 125', 'Maestro Edge 110', 'Maestro Edge 125'
    ]
  },
  {
    brand: 'Bajaj',
    models: [
      'Pulsar 125', 'Pulsar 150', 'Pulsar NS200', 'Pulsar NS160', 'Pulsar N160', 'Pulsar N250', 'Pulsar RS200', 'Dominar 250', 'Dominar 400', 'Avenger 160', 'Avenger 220', 'CT100', 'CT110', 'Platina 100', 'Platina 110 H-Gear', 'Discover 125', 'Discover 150'
    ]
  },
  {
    brand: 'TVS',
    models: [
      'Sport', 'Star City Plus', 'Radeon', 'Apache RTR 160', 'Apache RTR 160 4V', 'Apache RTR 180', 'Apache RTR 200 4V', 'Apache RR 310', 'Raider 125', 'Ronin', 'XL100', 'Scooty Pep+', 'Zest 110', 'Jupiter 110', 'Jupiter 125', 'NTorq 125'
    ]
  },
  {
    brand: 'Honda',
    models: [
      'Shine 100', 'Shine 125', 'SP 125', 'Unicorn', 'XBlade', 'Hornet 2.0', 'CB200X', 'CB300F', "CB350 H'ness", 'CB350 RS', 'Activa', 'Activa 3G', 'Activa 4G', 'Activa 5G', 'Activa 6G', 'Activa 125', 'Dio', 'Dio 125'
    ]
  },
  {
    brand: 'Yamaha',
    models: [
      'FZ V3', 'FZ-S FI V4', 'FZ-X', 'R15 V4', 'R15M', 'MT-15 V2', 'FZ25', 'FZS25', 'Fascino 125', 'RayZR 125'
    ]
  },
  {
    brand: 'KTM',
    models: [
      'Duke 125', 'Duke 200', 'Duke 250', 'Duke 390', 'RC 125', 'RC 200', 'RC 390', '390 Adventure', '390 Adventure X'
    ]
  },
  {
    brand: 'Suzuki',
    models: [
      'Gixxer', 'Gixxer SF', 'Gixxer 250', 'Gixxer SF 250', 'Intruder 150', 'Access 125', 'Burgman Street 125', 'Avenis 125'
    ]
  },
  {
    brand: 'Jawa / Yezdi',
    models: [
      'Jawa 42', 'Jawa Classic', 'Jawa Perak', 'Jawa 350', 'Yezdi Roadster', 'Yezdi Scrambler', 'Yezdi Adventure'
    ]
  },
  {
    brand: 'Kawasaki',
    models: [
      'Ninja 300', 'Ninja 400', 'Ninja 650', 'Z650', 'Z900'
    ]
  },
  {
    brand: 'Benelli',
    models: [
      'Imperiale 400', 'TRK 502', 'Leoncino 250', '600i', '300i'
    ]
  },
  {
    brand: 'Royal Enfield',
    models: [
      'Bullet 350', 'Classic 350', 'Hunter 350', 'Meteor 350', 'Scram 411', 'Himalayan 450', 'Interceptor 650', 'Continental GT 650'
    ]
  },
  {
    brand: 'Aprilia',
    models: [
      'SR 125', 'SR 160', 'SXR 125', 'SXR 160', 'RS 660', 'Tuono 660', 'RSV4 1100 Factory'
    ]
  },
  {
    brand: 'Harley-Davidson',
    models: [
      'X440', 'Iron 883', 'Forty-Eight', 'Nightster', 'Street Bob 114', 'Fat Bob 114', 'Fat Boy 114', 'Heritage Classic', 'Street Glide', 'Road Glide'
    ]
  },
  {
    brand: 'BMW',
    models: [
      'G310R', 'G310GS', 'F900R', 'F900XR', 'R1250GS', 'S1000RR', 'R18'
    ]
  },
  {
    brand: 'Ducati',
    models: [
      'Monster', 'Hypermotard 950', 'Scrambler Icon', 'Scrambler 1100', 'Multistrada V4', 'Diavel 1260', 'Panigale V2', 'Panigale V4', 'Streetfighter V2', 'Streetfighter V4'
    ]
  }
];

function renderBrandModelsCatalog() {
  const container = document.querySelector('.brand-catalog-container');
  if (!container) return;
  container.innerHTML = '';
  brandModelsCatalog.forEach(({ brand, models }) => {
    const details = document.createElement('details');
    details.className = 'brand-dropdown';
    const summary = document.createElement('summary');
    summary.textContent = brand;
    details.appendChild(summary);
    const list = document.createElement('div');
    list.className = 'brand-model-list';
    models.forEach(model => {
      const btn = document.createElement('button');
      btn.className = 'brand-model-btn';
      btn.textContent = model;
      btn.setAttribute('data-brand', brand);
      btn.setAttribute('data-model', model);
      // btn.onclick = () => { /* ready for linking to booking/servicing */ };
      list.appendChild(btn);
    });
    details.appendChild(list);
    container.appendChild(details);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderBrandModelsCatalog();
});

// Show bike details in modal
window.showBikeDetails = function(bike) {
    const modal = document.getElementById('sale-contact-modal');
    const content = document.getElementById('bike-details-content');
    
    // Format price with commas for Indian numbering system
    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(bike.price);

    content.innerHTML = `
        <div style="text-align:center;margin-bottom:2rem;">
            <img src="${bike.image_url || '../images/motorcycle.jpg.png'}" 
                 alt="${bike.brand} ${bike.model}" 
                 style="max-width:100%;max-height:400px;object-fit:contain;border-radius:8px;">
        </div>
        <h2 style="color:var(--primary-blue);margin-bottom:1rem;">${bike.brand} ${bike.model}</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:1.5rem;margin-bottom:1.5rem;">
            <div>
                <h4 style="color:#666;margin-bottom:0.5rem;">Price</h4>
                <p style="font-size:1.2rem;font-weight:500;">${formattedPrice}</p>
            </div>
            <div>
                <h4 style="color:#666;margin-bottom:0.5rem;">Year</h4>
                <p>${bike.year}</p>
            </div>
            <div>
                <h4 style="color:#666;margin-bottom:0.5rem;">Condition</h4>
                <p>${bike.condition || 'Not specified'}</p>
            </div>
        </div>
        <div>
            <h4 style="color:#666;margin-bottom:0.5rem;">Description</h4>
            <p style="line-height:1.6;">${bike.description || 'No description available'}</p>
        </div>
        <div style="text-align:center;margin-top:2rem;">
            <button onclick="showContactOptions()" class="primary-button" style="background-color:#2B4B8C;color:white;padding:0.75rem 2rem;border:none;border-radius:6px;cursor:pointer;font-size:1rem;">
                Contact Dealer
            </button>
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
};

// Show contact options
window.showContactOptions = function() {
    const content = document.getElementById('bike-details-content');
    const dealerPhone = '+91 7310542113';
    const dealerEmail = 'lalamotors1@gmail.com';
    const storeAddress = 'Ahmedia market, 4/143, Baluganj, Rakabganj, Agra, Uttar Pradesh 282001, India';
    const googleMapsLink = 'https://maps.app.goo.gl/tJf7tQqHnyA7ffYA7';
    
    content.innerHTML = `
        <h3 style="color:var(--primary-blue);margin-bottom:1.5rem;">Contact Dealer</h3>
        <div style="text-align:center;">
            <p style="margin-bottom:1rem;">You can reach our dealer through:</p>
            <div style="margin-bottom:1.5rem;">
                <h4 style="color:#666;margin-bottom:0.5rem;">Phone</h4>
                <a href="tel:${dealerPhone}" class="primary-button" style="display:inline-block;text-decoration:none;margin:0.5rem;background-color:#2B4B8C;color:white;padding:0.75rem 1.5rem;border-radius:6px;">
                    <i class="fas fa-phone"></i> ${dealerPhone}
                </a>
            </div>
            <div style="margin-bottom:1.5rem;">
                <h4 style="color:#666;margin-bottom:0.5rem;">Email</h4>
                <a href="mailto:${dealerEmail}" class="primary-button" style="display:inline-block;text-decoration:none;margin:0.5rem;background-color:#2B4B8C;color:white;padding:0.75rem 1.5rem;border-radius:6px;">
                    <i class="fas fa-envelope"></i> ${dealerEmail}
                </a>
            </div>
            <div>
                <h4 style="color:#666;margin-bottom:0.5rem;">Visit Our Store</h4>
                <p style="margin-bottom:0.5rem;">LALA MOTORS</p>
                <p style="margin-bottom:1rem;color:#666;line-height:1.5;">${storeAddress}</p>
                <a href="${googleMapsLink}" target="_blank" class="primary-button" style="display:inline-block;text-decoration:none;margin:0.5rem;background-color:#2B4B8C;color:white;padding:0.75rem 1.5rem;border-radius:6px;">
                    <i class="fas fa-directions"></i> Get Directions
                </a>
            </div>
        </div>
    `;
};

// Close modal
window.closeContactModal = function() {
    const modal = document.getElementById('sale-contact-modal');
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
};

// On DOMContentLoaded, setup the new logic
window.addEventListener('DOMContentLoaded', () => {
    populateVehicles();
    setupMobileNav();
    setupSmoothScroll();
});

document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Zipper intro animation
    const zipperIntro = document.getElementById('zipper-intro');
    if (zipperIntro && !sessionStorage.getItem('introPlayed')) {
        setTimeout(() => {
            zipperIntro.classList.add('unzipped');
            sessionStorage.setItem('introPlayed', 'true');
        }, 500); // Small delay before starting

        setTimeout(() => {
            zipperIntro.style.display = 'none';
        }, 2000); // Hide after animation (1.2s transition + buffer)
    } else if (zipperIntro) {
        zipperIntro.style.display = 'none';
    }

    // Scroll-triggered animations for service cards
    const serviceCards = document.querySelectorAll('.service-card');

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    serviceCards.forEach(card => {
        observer.observe(card);
    });
}); 

document.addEventListener('DOMContentLoaded', () => {
    // This is for the main site, but we can add admin logic here too
    // if the script is loaded on admin.html
    if (document.getElementById('adminPanel')) {
        setupAdminPanel();
    }
    
    if(document.getElementById('cart-count')) {
        updateCartCount();
    }
});

function setupAdminPanel() {
    const autoPartForm = document.getElementById('autoPartForm');
    const partBrandSelect = document.getElementById('partBrand');
    const partModelSelect = document.getElementById('partModel');
    const partCategorySelect = document.getElementById('partCategory');
    const partNameSelect = document.getElementById('partName');
    
    let autoParts = [];

    function populateAutoPartsDropdowns() {
        if(typeof brands !== 'undefined') {
            brands.forEach(brand => {
                const option = document.createElement('option');
                option.value = brand.name;
                option.textContent = brand.name;
                partBrandSelect.appendChild(option);
            });
        }

        // Populate categories
        if(typeof partsCategories !== 'undefined') {
            for (const category in partsCategories) {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                partCategorySelect.appendChild(option);
            }
        }
    }

    partBrandSelect.addEventListener('change', () => {
        const selectedBrandName = partBrandSelect.value;
        partModelSelect.innerHTML = '<option value="">Select Model</option>';
        if (selectedBrandName && typeof brands !== 'undefined') {
            const selectedBrand = brands.find(brand => brand.name === selectedBrandName);
            if (selectedBrand) {
                selectedBrand.models.forEach(model => {
                    const option = document.createElement('option');
                    option.value = model;
                    option.textContent = model;
                    partModelSelect.appendChild(option);
                });
            }
        }
    });
    
    partCategorySelect.addEventListener('change', () => {
        const selectedCategory = partCategorySelect.value;
        partNameSelect.innerHTML = '<option value="">Select Part</option>';
        if (selectedCategory && typeof partsCategories !== 'undefined' && partsCategories[selectedCategory]) {
            partsCategories[selectedCategory].forEach(partName => {
                const option = document.createElement('option');
                option.value = partName;
                option.textContent = partName;
                partNameSelect.appendChild(option);
            });
        }
    });
    
    function renderAutoParts() {
        autoPartsTableBody.innerHTML = '';
        autoParts.forEach((part, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${part.brand}</td>
                <td>${part.model}</td>
                <td>${part.category}</td>
                <td>${part.name}</td>
                <td>${part.price}</td>
                <td>${part.quantity}</td>
                <td><img src="${part.image}" alt="${part.name}" width="50"></td>
                <td><button onclick="deleteAutoPart(${index})">Delete</button></td>
            `;
            autoPartsTableBody.appendChild(row);
        });
    }

    autoPartForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(autoPartForm);
        const part = Object.fromEntries(formData.entries());

        const imageFile = formData.get('image');
        if (imageFile && imageFile.size > 0) {
            part.image = URL.createObjectURL(imageFile);
        } else {
            part.image = ''; // or a placeholder image
        }

        autoParts.push(part);
        renderAutoParts();
        autoPartForm.reset();
        partModelSelect.innerHTML = '<option value="">Select Model</option>';
        partNameSelect.innerHTML = '<option value="">Select Part</option>';
    });

    window.deleteAutoPart = (index) => {
        autoParts.splice(index, 1);
        renderAutoParts();
    }

    populateAutoPartsDropdowns();
} 

// Professional scroll-in animations
(function() {
  const observer = new window.IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  // Animate service cards
  document.querySelectorAll('.service-card').forEach(card => {
    card.classList.add('animate-fade-in-up');
    observer.observe(card);
  });
  // Animate brand logo cards
  document.querySelectorAll('.brand-logo-card').forEach(card => {
    card.classList.add('animate-scale-in');
    observer.observe(card);
  });
  // Animate section titles
  document.querySelectorAll('.section-title').forEach(title => {
    title.classList.add('animate-fade-in-up');
    observer.observe(title);
  });
})();

// Hero bike card image slider
(function() {
  const imgs = document.querySelectorAll('.hero-slider-img');
  const dots = document.querySelectorAll('.hero-slider-dots .dot');
  if (imgs.length && dots.length) {
    let current = 0;
    function show(idx) {
      imgs.forEach((img, i) => img.style.display = i === idx ? 'block' : 'none');
      dots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
      current = idx;
    }
    dots.forEach((dot, i) => {
      dot.addEventListener('click', e => {
        show(i);
      });
    });
    // Optional: auto-slide every 4s
    setInterval(() => {
      show((current + 1) % imgs.length);
    }, 4000);
  }
})();

// Honda bike card image slider
(function() {
  const imgs = document.querySelectorAll('.honda-slider-img');
  const dots = document.querySelectorAll('.honda-slider-dots .dot');
  if (imgs.length && dots.length) {
    let current = 0;
    function show(idx) {
      imgs.forEach((img, i) => img.style.display = i === idx ? 'block' : 'none');
      dots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
      current = idx;
    }
    dots.forEach((dot, i) => {
      dot.addEventListener('click', e => {
        show(i);
      });
    });
    // Optional: auto-slide every 4s
    setInterval(() => {
      show((current + 1) % imgs.length);
    }, 4000);
  }
})();

// Bajaj bike card image slider
(function() {
  const imgs = document.querySelectorAll('.bajaj-slider-img');
  const dots = document.querySelectorAll('.bajaj-slider-dots .dot');
  if (imgs.length && dots.length) {
    let current = 0;
    function show(idx) {
      imgs.forEach((img, i) => img.style.display = i === idx ? 'block' : 'none');
      dots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
      current = idx;
    }
    dots.forEach((dot, i) => {
      dot.addEventListener('click', e => {
        show(i);
      });
    });
    setInterval(() => {
      show((current + 1) % imgs.length);
    }, 4000);
  }
})();

// Suzuki bike card image slider
(function() {
  const imgs = document.querySelectorAll('.suzuki-slider-img');
  const dots = document.querySelectorAll('.suzuki-slider-dots .dot');
  if (imgs.length && dots.length) {
    let current = 0;
    function show(idx) {
      imgs.forEach((img, i) => img.style.display = i === idx ? 'block' : 'none');
      dots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
      current = idx;
    }
    dots.forEach((dot, i) => {
      dot.addEventListener('click', e => {
        show(i);
      });
    });
    setInterval(() => {
      show((current + 1) % imgs.length);
    }, 4000);
  }
})();

// Royal Enfield bike card image slider
(function() {
  const imgs = document.querySelectorAll('.enfield-slider-img');
  const dots = document.querySelectorAll('.enfield-slider-dots .dot');
  if (imgs.length && dots.length) {
    let current = 0;
    function show(idx) {
      imgs.forEach((img, i) => img.style.display = i === idx ? 'block' : 'none');
      dots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
      current = idx;
    }
    dots.forEach((dot, i) => {
      dot.addEventListener('click', e => {
        show(i);
      });
    });
    setInterval(() => {
      show((current + 1) % imgs.length);
    }, 4000);
  }
})();

// TVS bike card image slider
(function() {
  const imgs = document.querySelectorAll('.tvs-slider-img');
  const dots = document.querySelectorAll('.tvs-slider-dots .dot');
  if (imgs.length && dots.length) {
    let current = 0;
    function show(idx) {
      imgs.forEach((img, i) => img.style.display = i === idx ? 'block' : 'none');
      dots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
      current = idx;
    }
    dots.forEach((dot, i) => {
      dot.addEventListener('click', e => {
        show(i);
      });
    });
    setInterval(() => {
      show((current + 1) % imgs.length);
    }, 4000);
  }
})();

// Yamaha bike card image slider
(function() {
  const imgs = document.querySelectorAll('.yamaha-slider-img');
  const dots = document.querySelectorAll('.yamaha-slider-dots .dot');
  if (imgs.length && dots.length) {
    let current = 0;
    function show(idx) {
      imgs.forEach((img, i) => img.style.display = i === idx ? 'block' : 'none');
      dots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
      current = idx;
    }
    dots.forEach((dot, i) => {
      dot.addEventListener('click', e => {
        show(i);
      });
    });
    setInterval(() => {
      show((current + 1) % imgs.length);
    }, 4000);
  }
})();

// KTM bike card image slider
(function() {
  const imgs = document.querySelectorAll('.ktm-slider-img');
  const dots = document.querySelectorAll('.ktm-slider-dots .dot');
  if (imgs.length && dots.length) {
    let current = 0;
    function show(idx) {
      imgs.forEach((img, i) => img.style.display = i === idx ? 'block' : 'none');
      dots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
      current = idx;
    }
    dots.forEach((dot, i) => {
      dot.addEventListener('click', e => {
        show(i);
      });
    });
    setInterval(() => {
      show((current + 1) % imgs.length);
    }, 4000);
  }
})();

// Sticky header hide on scroll down, show on scroll up
let lastScrollTop = 0;
let lastHeaderHide = 0;
const header = document.querySelector('header');
const hamburger = document.querySelector('.hamburger');
const HEADER_DELTA = 80; // px to scroll up before showing header
window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop && scrollTop > 80) {
        // Scrolling down
        header.classList.add('header-hidden');
        if (hamburger) hamburger.classList.add('header-hidden');
        lastHeaderHide = scrollTop;
    } else if (lastHeaderHide - scrollTop > HEADER_DELTA) {
        // Only show header if scrolled up by HEADER_DELTA
        header.classList.remove('header-hidden');
        if (hamburger) hamburger.classList.remove('header-hidden');
        lastHeaderHide = scrollTop;
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}, { passive: true });

// Calibrate bike name ticker speed so all scroll at the same pixel speed
function calibrateScrollingTextSpeed() {
    const PIXELS_PER_SECOND = 40; // adjust for desired speed
    document.querySelectorAll('.scrolling-text').forEach(el => {
        const height = el.scrollHeight;
        const duration = height / PIXELS_PER_SECOND;
        el.style.animationDuration = duration + 's';
    });
}

document.addEventListener('DOMContentLoaded', calibrateScrollingTextSpeed);
window.addEventListener('resize', calibrateScrollingTextSpeed);

// --- PERFORMANCE OPTIMIZATIONS FOR MOBILE ---
// 1. Use passive event listeners for scroll/touch
window.addEventListener('scroll', () => {}, { passive: true });
window.addEventListener('touchmove', () => {}, { passive: true });

// 2. will-change for interactive cards/buttons
function applyWillChange() {
    document.querySelectorAll('.service-card, .brand-logo-card, .bike-cards-section .bike-card, .primary-button, .secondary-button').forEach(el => {
        el.style.willChange = 'transform';
    });
}

// 3. Lazy load images
function applyLazyLoading() {
    document.querySelectorAll('img').forEach(img => {
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
    });
}

// 4. Reduce animation/transition durations for mobile
function reduceMobileAnimationDurations() {
    if (window.innerWidth <= 768) {
        document.documentElement.style.setProperty('--animation-duration', '0.2s');
        document.querySelectorAll('.animated').forEach(el => {
            el.style.animationDuration = '0.3s';
        });
    }
}

// 5. Throttle expensive JS in scroll/resize
let lastScroll = 0;
window.addEventListener('scroll', function() {
    const now = Date.now();
    if (now - lastScroll > 60) {
        lastScroll = now;
        // Place any scroll-related logic here if needed
    }
}, { passive: true });

let lastResize = 0;
window.addEventListener('resize', function() {
    const now = Date.now();
    if (now - lastResize > 120) {
        lastResize = now;
        reduceMobileAnimationDurations();
    }
});

// Run optimizations on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    applyWillChange();
    applyLazyLoading();
    reduceMobileAnimationDurations();
});

function hideHeaderForModal() {
  document.body.classList.add('hide-header');
}
function showHeaderAfterModal() {
  document.body.classList.remove('hide-header');
}

// ... existing code ...
window.addEventListener('DOMContentLoaded', () => {
  // ... existing code ...

  // Supabase Auth: Only show login button when logged out; show user badge or profile pic when logged in
  const supabaseUrl = 'https://fjhlglaivlbrowsuxres.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqaGxnbGFpdmxicm93c3V4cmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1OTUwNDYsImV4cCI6MjA2NjE3MTA0Nn0.0p7afOyJ_Q67d0k7ZTQWnxYIJ6eseuNx_7yjupT6eWo';
  if (!window.supabaseClient && window.supabase && typeof window.supabase.createClient === 'function') {
    window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
  }
  if (window.supabaseClient) {
    const supabase = window.supabaseClient;
    function updateLoginBtns(session) {
      const loginBtns = document.querySelectorAll('.login-btn');
      const isInsideServices = window.location.pathname.includes('/services/');
      const profileUrl = isInsideServices ? 'profile.html' : 'services/profile.html';
      const loginUrl = isInsideServices ? 'login.html' : 'services/login.html';

      loginBtns.forEach(loginBtn => {
        if (session && session.user) {
          // Show profile picture or initial badge
          const user = session.user;
          let profilePic = user.user_metadata && (user.user_metadata.avatar_url || user.user_metadata.picture);
          let name = (user.user_metadata && (user.user_metadata.full_name || user.user_metadata.name)) || '';
          let email = user.email || '';
          let initial = '?';
          if (name && name.trim().length > 0) {
            initial = name.trim().charAt(0).toUpperCase();
          } else if (email && email.trim().length > 0) {
            initial = email.trim().charAt(0).toUpperCase();
          }
          let badgeHtml = '';
          if (profilePic) {
            badgeHtml = `<img src="${profilePic}" alt="Profile" class="user-avatar-badge" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">`;
          } else {
            badgeHtml = `<span class="user-initial-badge">${initial}</span>`;
          }
          loginBtn.innerHTML = badgeHtml;
          loginBtn.setAttribute('title', name || email || 'Profile');
          loginBtn.onclick = function(e) {
            e.preventDefault();
            window.location.href = profileUrl;
          };
          loginBtn.setAttribute('href', profileUrl);
          loginBtn.style.display = '';
        } else {
          // Show login icon and link when logged out
          loginBtn.style.display = '';
          loginBtn.innerHTML = '<i class="fa-regular fa-user"></i>';
          loginBtn.setAttribute('title', 'Login');
          loginBtn.onclick = null;
          loginBtn.setAttribute('href', loginUrl);
        }
      });
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateLoginBtns(session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      updateLoginBtns(session);
    });
  }

  // ... existing code ...
});
// ... existing code ...

// Sidebar menu logic
function setupSidebarMenu() {
  const sidebar = document.getElementById('sidebar-menu');
  const overlay = document.getElementById('sidebar-overlay');
  const hamburger = document.getElementById('sidebar-hamburger');
  const closeBtn = document.getElementById('close-sidebar');
  const logoutLi = document.getElementById('sidebar-logout-li');
  const logoutBtn = document.getElementById('sidebar-logout');
  const profileName = document.getElementById('sidebar-profile-name');
  const profileEmail = document.getElementById('sidebar-profile-email');

  async function updateSidebarProfile() {
    const client = window.supabaseClient || (window.supabase && typeof window.supabase.createClient === 'function' ? window.supabase.createClient('https://fjhlglaivlbrowsuxres.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqaGxnbGFpdmxicm93c3V4cmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1OTUwNDYsImV4cCI6MjA2NjE3MTA0Nn0.0p7afOyJ_Q67d0k7ZTQWnxYIJ6eseuNx_7yjupT6eWo') : null);
    if (client) {
      const { data: { user } } = await client.auth.getUser();
      const profileIcon = document.querySelector('.sidebar-profile-icon');
      if (user) {
        const name = (user.user_metadata && (user.user_metadata.full_name || user.user_metadata.name)) || '';
        profileName.textContent = name || user.email || 'User';
        profileEmail.textContent = user.email || '';
        if (profileIcon) {
          let initial = (name ? name.trim().charAt(0) : (user.email ? user.email.trim().charAt(0) : 'U')).toUpperCase();
          profileIcon.outerHTML = `<span class="user-initial-badge sidebar-profile-icon" style="margin-right:12px;width:38px;height:38px;font-size:1.1rem;">${initial}</span>`;
        }
      } else {
        profileName.textContent = 'Guest';
        profileEmail.textContent = '';
      }
    }
  }

  function openSidebar() {
    sidebar.style.display = 'flex';
    overlay.style.display = 'block';
    setTimeout(() => {
      sidebar.classList.add('open');
      overlay.style.opacity = 1;
    }, 10);
    updateSidebarProfile();
  }
  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.style.opacity = 0;
    setTimeout(() => {
      sidebar.style.display = 'none';
      overlay.style.display = 'none';
    }, 250);
  }
  if (hamburger) hamburger.onclick = openSidebar;
  if (closeBtn) closeBtn.onclick = closeSidebar;
  if (overlay) overlay.onclick = closeSidebar;
  // Prevent sidebar click from closing
  if (sidebar) sidebar.onclick = e => e.stopPropagation();
  // Logout logic
  if (logoutBtn) {
    const client = window.supabaseClient || (window.supabase && typeof window.supabase.createClient === 'function' ? window.supabase.createClient('https://fjhlglaivlbrowsuxres.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqaGxnbGFpdmxicm93c3V4cmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1OTUwNDYsImV4cCI6MjA2NjE3MTA0Nn0.0p7afOyJ_Q67d0k7ZTQWnxYIJ6eseuNx_7yjupT6eWo') : null);
    if (client) {
      client.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          if (logoutLi) logoutLi.style.display = '';
          logoutBtn.onclick = async (e) => {
            e.preventDefault();
            await client.auth.signOut();
            closeSidebar();
            window.location.reload();
          };
        } else {
          if (logoutLi) logoutLi.style.display = 'none';
        }
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  setupSidebarMenu();
});
// ... existing code ...

// ... existing code ...

// Sidebar menu item functionality
function showSidebarModal(title, content, actions = []) {
  // Remove existing modal if present
  let modal = document.getElementById('sidebar-modal');
  if (modal) modal.remove();
  modal = document.createElement('div');
  modal.id = 'sidebar-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.25)';
  modal.style.zIndex = '3000';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.innerHTML = `
    <div style="background:#fff;padding:2rem 1.5rem;max-width:95vw;width:350px;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.13);position:relative;">
      <button id="sidebar-modal-close" style="position:absolute;top:10px;right:10px;font-size:1.3rem;background:none;border:none;cursor:pointer;">&times;</button>
      <h2 style="font-size:1.2rem;margin-bottom:1rem;">${title}</h2>
      <div style="margin-bottom:1.2rem;">${content}</div>
      <div style="display:flex;gap:0.7rem;">${actions.map(a => `<button class="sidebar-modal-action" data-action="${a.action}">${a.label}</button>`).join('')}</div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('sidebar-modal-close').onclick = () => modal.remove();
  modal.querySelectorAll('.sidebar-modal-action').forEach(btn => {
    btn.onclick = () => {
      if (btn.dataset.action && typeof window[btn.dataset.action] === 'function') window[btn.dataset.action]();
      modal.remove();
    };
  });
}

// Orders
const ordersBtn = document.getElementById('sidebar-orders');
if (ordersBtn) {
  ordersBtn.onclick = function(e) {
    e.preventDefault();
    window.location.href = '/services/orders.html';
  }
}

// Subscriptions
const subsBtn = document.getElementById('sidebar-subscriptions');
if (subsBtn) subsBtn.onclick = function(e) {
  e.preventDefault();
  // TODO: Replace with real subscription fetch
  const hasSub = false;
  if (hasSub) {
    showSidebarModal('Your Subscriptions', '<div>You are subscribed to: <b>Gold Plan</b></div>');
  } else {
    showSidebarModal('Your Subscriptions', 'No subscription plan purchased.', [{label:'Get Subscribed Now',action:'sidebarGetSubscribed'}]);
  }
};
window.sidebarGetSubscribed = function() { window.location.href = '/services/subscription.html'; };

// Customer Care
const supportBtn = document.getElementById('sidebar-support');
if (supportBtn) supportBtn.onclick = function(e) {
  e.preventDefault();
  showSidebarModal('Customer Care', `
    <div style='display:flex;flex-direction:column;gap:0.7rem;'>
      <a href='tel:7310542113' style='color:#2B4B8C;font-weight:600;'><i class='fa fa-phone'></i> Call Now</a>
      <a href='mailto:lalamotors1@gmail.com' style='color:#2B4B8C;font-weight:600;'><i class='fa fa-envelope'></i> Email Us</a>
      <a href='https://wa.me/917310542113?text=Hi%20Lala%20Motors!' target='_blank' style='color:#2B4B8C;font-weight:600;'><i class='fa fa-whatsapp'></i> WhatsApp</a>
    </div>
  `);
};

// --- NEW SIDEBAR MENU ITEMS ---

// Profile Information (replaces Edit Profile)
const profileInfoBtn = document.getElementById('sidebar-profile-info');
if (profileInfoBtn) {
  profileInfoBtn.onclick = function(e) {
    e.preventDefault();
    window.location.href = '/services/profile.html';
  };
}

// Manage Address
const manageAddressBtn = document.getElementById('sidebar-manage-address');
if (manageAddressBtn) {
  manageAddressBtn.onclick = (e) => {
    e.preventDefault();
    window.location.href = '/services/address.html';
  }
}

// Cart
const cartBtn = document.getElementById('sidebar-cart');
if (cartBtn) {
  cartBtn.onclick = (e) => {
    e.preventDefault();
    window.location.href = '/services/cart.html';
  }
}

// UPI Saved
const upiSavedBtn = document.getElementById('sidebar-upi-saved');
if (upiSavedBtn) upiSavedBtn.onclick = (e) => {
    e.preventDefault();
    showSidebarModal('Saved UPI', 'Feature coming soon!');
}

// Add New Payment
const addPaymentBtn = document.getElementById('sidebar-add-payment');
if (addPaymentBtn) addPaymentBtn.onclick = (e) => {
    e.preventDefault();
    showSidebarModal('Add New Payment', 'Feature coming soon!');
}

// Last Services Booked
const lastServiceBtn = document.getElementById('sidebar-last-service');
if (lastServiceBtn) lastServiceBtn.onclick = (e) => {
    e.preventDefault();
    window.location.href = '/services/last-services-booked.html';
};

// Invoices
const invoicesBtn = document.getElementById('sidebar-invoices');
if (invoicesBtn) invoicesBtn.onclick = (e) => {
    e.preventDefault();
    showSidebarModal('Invoices', 'Feature coming soon!');
}

// Edit Profile (with address/contact)
const editProfileBtn = document.getElementById('sidebar-edit-profile');
if (editProfileBtn) editProfileBtn.onclick = function(e) {
  e.preventDefault();
  showSidebarModal('Edit Profile', `
    <form id='sidebar-edit-profile-form' style='display:flex;flex-direction:column;gap:0.7rem;'>
      <input type='text' id='edit-name' placeholder='New Name' style='padding:0.5rem;border-radius:6px;border:1px solid #ccc;'>
      <input type='text' id='edit-address' placeholder='New Address' style='padding:0.5rem;border-radius:6px;border:1px solid #ccc;'>
      <input type='text' id='edit-contact' placeholder='New Contact Number' style='padding:0.5rem;border-radius:6px;border:1px solid #ccc;'>
      <button type='submit' style='background:#FFD700;color:#2B4B8C;font-weight:600;padding:0.5rem 1rem;border:none;border-radius:6px;cursor:pointer;'>Save Changes</button>
    </form>
  `);
  setTimeout(() => {
    const form = document.getElementById('sidebar-edit-profile-form');
    if (form) form.onsubmit = function(ev) {
      ev.preventDefault();
      // TODO: Save profile changes via API
      showNotification('Profile updated!');
      document.getElementById('sidebar-modal').remove();
    };
  }, 100);
};

// Language Change
const langBtn = document.getElementById('sidebar-language');
if (langBtn) langBtn.onclick = function(e) {
  e.preventDefault();
  showSidebarModal('Select Language', `
    <select id='sidebar-lang-select' style='width:100%;padding:0.5rem;border-radius:6px;border:1px solid #ccc;'>
      <option value='en'>English</option>
      <option value='hi'>Hindi</option>
      <option value='bn'>Bengali</option>
      <option value='mr'>Marathi</option>
      <option value='ta'>Tamil</option>
      <option value='te'>Telugu</option>
      <option value='gu'>Gujarati</option>
      <option value='kn'>Kannada</option>
      <option value='ml'>Malayalam</option>
      <option value='pa'>Punjabi</option>
    </select>
    <button id='sidebar-lang-save' style='margin-top:0.7rem;background:#FFD700;color:#2B4B8C;font-weight:600;padding:0.5rem 1rem;border:none;border-radius:6px;cursor:pointer;width:100%;'>Save</button>
  `);
  setTimeout(() => {
    document.getElementById('sidebar-lang-save').onclick = function() {
      const lang = document.getElementById('sidebar-lang-select').value;
      // TODO: Actually change language
      showNotification('Language changed to ' + lang);
      document.getElementById('sidebar-modal').remove();
    };
  }, 100);
};

// Switch Profile
const switchProfileBtn = document.getElementById('sidebar-switch-profile');
if (switchProfileBtn) switchProfileBtn.onclick = function(e) {
  e.preventDefault();
  showSidebarModal('Switch Profile', `
    <div style='margin-bottom:1rem;'>Switch to another user profile?</div>
    <button id='sidebar-switch-profile-confirm' style='background:#FFD700;color:#2B4B8C;font-weight:600;padding:0.5rem 1rem;border:none;border-radius:6px;cursor:pointer;width:100%;'>Switch</button>
  `);
  setTimeout(() => {
    document.getElementById('sidebar-switch-profile-confirm').onclick = function() {
      // TODO: Implement real switch profile logic
      showNotification('Switched profile!');
      document.getElementById('sidebar-modal').remove();
    };
  }, 100);
};

// Remove Saved Addresses and Change Contact from sidebar (handled in Edit Profile)
const addrLi = document.getElementById('sidebar-addresses');
if (addrLi) addrLi.parentElement.removeChild(addrLi);
const changeContactLi = document.getElementById('sidebar-change-contact');
if (changeContactLi) changeContactLi.parentElement.removeChild(changeContactLi);
// ... existing code ...

// ... existing code ...
// Cart icon/modal support for all pages
window.addEventListener('DOMContentLoaded', () => {
  const cartIcon = document.getElementById('cart-icon');
  const cartCount = document.getElementById('cart-count');
  if (cartIcon && cartCount) {
    // Use main cart if available, else autoparts cart
    let cart = [];
    if (localStorage.getItem('cart')) {
      cart = JSON.parse(localStorage.getItem('cart'));
      cartCount.textContent = cart.reduce((total, item) => total + (item.quantity || item.qty || 0), 0);
    } else if (localStorage.getItem('autoparts_cart')) {
      cart = JSON.parse(localStorage.getItem('autoparts_cart'));
      cartCount.textContent = cart.reduce((total, item) => total + (item.qty || item.quantity || 0), 0);
    } else {
      cartCount.textContent = 0;
    }
    cartIcon.onclick = function(e) {
      e.preventDefault();
      if (typeof showCartModal === 'function') showCartModal();
      else if (typeof window.showCartModal === 'function') window.showCartModal();
      const modal = document.getElementById('cart-modal');
      if (modal) modal.style.display = 'block';
    };
  }
});
// ... existing code ...

// ... existing code ...
window.addToCart = addToCart;
// ... existing code ...

// ... existing code ...
// Mobile filter panel show/hide logic for orders page
function toggleMobileFilters(show) {
  var filtersPanel = document.querySelector('.orders-mobile-filters');
  var body = document.body;
  if (!filtersPanel) return;
  if (show) {
    filtersPanel.classList.add('active');
    body.classList.add('hide-header');
  } else {
    filtersPanel.classList.remove('active');
    body.classList.remove('hide-header');
  }
}
// Attach to filter button and close button if present
window.addEventListener('DOMContentLoaded', function() {
  var filterBtn = document.querySelector('.orders-mobile-filters-btn');
  var closeBtn = document.querySelector('.orders-mobile-filters .close-btn');
  if (filterBtn) {
    filterBtn.onclick = function() { toggleMobileFilters(true); };
  }
  if (closeBtn) {
    closeBtn.onclick = function() { toggleMobileFilters(false); };
  }
});
// ... existing code ...

// ... existing code ...
// Universal sidebar/hamburger/modal toggle for all browsers
// REMOVED: This was conflicting with setupSidebarMenu()
// The proper sidebar handling is now done by setupSidebarMenu() only
// ... existing code ...

// ... existing code ...
// --- Global Supabase Client Initialization ---
if (!window.supabaseClient) {
  const supabaseUrl = 'https://fjhlglaivlbrowsuxres.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqaGxnbGFpdmxicm93c3V4cmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1OTUwNDYsImV4cCI6MjA2NjE3MTA0Nn0.0p7afOyJ_Q67d0k7ZTQWnxYIJ6eseuNx_7yjupT6eWo';
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
  } else {
    console.error('Supabase library not loaded! Make sure to include https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2 before script.js');
  }
}

// ==========================================================================
// 3D TILT, SPECULAR GLARE & MOUSE SCROLL PERSPECTIVE PHYSICS ENGINE
// ==========================================================================
(function init3DEngine() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  // 1. Setup 3D Top Progress Bar
  function setupProgressBar() {
    if (!document.querySelector('.scroll-progress-3d')) {
      const bar = document.createElement('div');
      bar.className = 'scroll-progress-3d';
      document.body.appendChild(bar);
    }
  }

  // 2. Interactive 3D Card Hover & Specular Light Reflection
  function setup3DTilt() {
    const tiltElements = document.querySelectorAll(
      '.service-card, .bike-card, .brand-logo-card'
    );

    tiltElements.forEach(card => {
      if (!card.querySelector('.tilt-glare-overlay')) {
        const glareOverlay = document.createElement('div');
        glareOverlay.className = 'tilt-glare-overlay';
        const glareElement = document.createElement('div');
        glareElement.className = 'tilt-glare-element';
        glareOverlay.appendChild(glareElement);
        card.appendChild(glareOverlay);
      }

      if (isTouchDevice) return;

      let rect = null;
      let rafId = null;
      const glareOverlay = card.querySelector('.tilt-glare-overlay');
      const glareElement = card.querySelector('.tilt-glare-element');

      const maxTilt = card.classList.contains('service-card') ? 14 :
                      card.classList.contains('brand-logo-card') ? 12 : 8;

      function onMouseMove(e) {
        if (!rect) rect = card.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const width = rect.width;
        const height = rect.height;

        const xPercent = (x / width) * 2 - 1;
        const yPercent = (y / height) * 2 - 1;

        const rotX = (-yPercent * maxTilt).toFixed(2);
        const rotY = (xPercent * maxTilt).toFixed(2);

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03, 1.03, 1.03)`;
          if (glareOverlay && glareElement) {
            glareOverlay.style.opacity = '1';
            glareElement.style.left = `${x}px`;
            glareElement.style.top = `${y}px`;
          }
        });
      }

      function onMouseEnter() {
        rect = card.getBoundingClientRect();
        card.style.transition = 'transform 0.1s ease-out, box-shadow 0.2s ease-out';
      }

      function onMouseLeave() {
        if (rafId) cancelAnimationFrame(rafId);
        card.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.4, 1), box-shadow 0.5s ease';
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        if (glareOverlay) {
          glareOverlay.style.opacity = '0';
        }
        rect = null;
      }

      card.addEventListener('mouseenter', onMouseEnter, { passive: true });
      card.addEventListener('mousemove', onMouseMove, { passive: true });
      card.addEventListener('mouseleave', onMouseLeave, { passive: true });
    });
  }

  // 3. Continuous 3D Scroll Physics & Velocity Pitch
  function setup3DScrollPhysics() {
    let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
    let scrollVelocity = 0;
    let currentPitch = 0;
    let isTicking = false;

    const progressBar = document.querySelector('.scroll-progress-3d');
    const heroContent = document.querySelector('.hero-content');
    const heroOrbs = document.querySelectorAll('.floating-orb');
    const servicesGrid = document.querySelector('.services-grid');
    const brandsGrid = document.querySelector('.brands-grid');
    const bikeContainer = document.querySelector('.bike-cards-container');

    function updateScrollEffects() {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      
      // Update 3D Progress Bar
      if (progressBar && maxScroll > 0) {
        const progress = Math.min(100, Math.max(0, (scrollY / maxScroll) * 100));
        progressBar.style.width = `${progress}%`;
      }

      // Calculate instantaneous scroll velocity
      const delta = scrollY - lastScrollY;
      lastScrollY = scrollY;
      scrollVelocity = scrollVelocity * 0.75 + delta * 0.25;

      // Target pitch angle based on velocity (clamped between -6deg and 6deg)
      const targetPitch = Math.max(-6, Math.min(6, scrollVelocity * 0.12));
      currentPitch += (targetPitch - currentPitch) * 0.18;

      // 1. Hero 3D Receding Parallax
      if (heroContent && scrollY < window.innerHeight) {
        const heroZ = -scrollY * 0.45;
        const heroOpacity = Math.max(0, 1 - (scrollY / (window.innerHeight * 0.75)));
        heroContent.style.transform = `perspective(1000px) translateZ(${heroZ}px) translateY(${scrollY * 0.25}px)`;
        heroContent.style.opacity = heroOpacity;
      }

      // 2. Floating Orbs Differential Depth
      if (heroOrbs.length > 0 && scrollY < window.innerHeight) {
        heroOrbs.forEach((orb, idx) => {
          const speed = idx === 0 ? 0.35 : -0.25;
          orb.style.transform = `translateY(${scrollY * speed}px) scale(${1 + (scrollY * 0.0004)})`;
        });
      }

      // 3. Grid 3D Dynamic Pitch on Mouse Scrolling
      if (Math.abs(currentPitch) > 0.05) {
        if (servicesGrid) {
          servicesGrid.style.transform = `perspective(1400px) rotateX(${currentPitch.toFixed(2)}deg)`;
        }
        if (brandsGrid) {
          brandsGrid.style.transform = `perspective(1400px) rotateX(${(currentPitch * 0.8).toFixed(2)}deg)`;
        }
        if (bikeContainer) {
          bikeContainer.style.transform = `perspective(1400px) rotateX(${(currentPitch * 0.7).toFixed(2)}deg)`;
        }
      } else {
        if (servicesGrid) servicesGrid.style.transform = 'perspective(1400px) rotateX(0deg)';
        if (brandsGrid) brandsGrid.style.transform = 'perspective(1400px) rotateX(0deg)';
        if (bikeContainer) bikeContainer.style.transform = 'perspective(1400px) rotateX(0deg)';
      }

      // Damp velocity when user stops scrolling
      scrollVelocity *= 0.85;

      if (Math.abs(scrollVelocity) > 0.1 || Math.abs(currentPitch) > 0.05) {
        requestAnimationFrame(updateScrollEffects);
      } else {
        isTicking = false;
      }
    }

    window.addEventListener('scroll', () => {
      if (!isTicking) {
        isTicking = true;
        requestAnimationFrame(updateScrollEffects);
      }
    }, { passive: true });
  }

  // 4. 3D Scroll Reveal Observer
  function setup3DScrollReveal() {
    const revealTargets = document.querySelectorAll(
      '.service-card, .brand-logo-card, .bike-card, .section-title, .booking-form-container'
    );

    if (!('IntersectionObserver' in window)) {
      revealTargets.forEach(el => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    revealTargets.forEach((el, index) => {
      el.classList.add('reveal-3d');
      if (el.classList.contains('service-card') || el.classList.contains('brand-logo-card')) {
        el.style.transitionDelay = `${(index % 4) * 0.08}s`;
      }
      observer.observe(el);
    });
  }

  // Initialize once DOM is ready
  function initAll() {
    setupProgressBar();
    setup3DTilt();
    setup3DScrollPhysics();
    setup3DScrollReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
