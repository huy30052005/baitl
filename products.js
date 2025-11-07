// Products JavaScript
// Dùng cho product-grid.html, product-list.html, product-details.html

// Sample product data
const PRODUCTS_DATA = [
  {
    id: 1,
    name: 'Áo thun nam màu đen Slim Fit',
    price: 80,
    oldPrice: 100,
    discount: 30,
    rating: 4.5,
    reviews: 65,
    stock: 486,
    sold: 155,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    category: 'Fashion',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['#1a1a1a', '#ffffff', '#ef4444', '#3b82f6', '#10b981']
  },
  {
    id: 2,
    name: 'Túi da màu xanh ô liu',
    price: 136,
    oldPrice: 150,
    discount: 30,
    rating: 4.1,
    reviews: 143,
    stock: 784,
    sold: 674,
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400',
    category: 'Hand Bag',
    sizes: ['S', 'M'],
    colors: ['#4ade80', '#1a1a1a']
  },
  {
    id: 3,
    name: 'Phụ nữ vàng Dress',
    price: 219,
    oldPrice: 250,
    discount: 30,
    rating: 4.4,
    reviews: 174,
    stock: 769,
    sold: 180,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
    category: 'Fashion',
    sizes: ['S', 'M', 'L'],
    colors: ['#fbbf24', '#ef4444']
  },
  {
    id: 4,
    name: 'Mũ Xám Cho Nam',
    price: 76,
    oldPrice: 100,
    discount: 30,
    rating: 4.2,
    reviews: 23,
    stock: 571,
    sold: 87,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400',
    category: 'Cap',
    sizes: ['S', 'M', 'L'],
    colors: ['#6b7280', '#1a1a1a']
  },
  {
    id: 5,
    name: 'Dark Green Cargo Pent',
    price: 110,
    oldPrice: null,
    discount: null,
    rating: 4.4,
    reviews: 109,
    stock: 241,
    sold: 342,
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400',
    category: 'Fashion',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#166534', '#1a1a1a']
  },
  {
    id: 6,
    name: 'Orange Multi Color Headphone',
    price: 231,
    oldPrice: null,
    discount: null,
    rating: 4.2,
    reviews: 200,
    stock: 821,
    sold: 231,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
    category: 'Electronics',
    sizes: ['S', 'M'],
    colors: ['#f97316', '#ec4899']
  },
  {
    id: 7,
    name: "Kid's Yellow Shoes",
    price: 89,
    oldPrice: null,
    discount: null,
    rating: 4.5,
    reviews: 321,
    stock: 321,
    sold: 681,
    image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=400',
    category: 'Shoes',
    sizes: ['18', '19', '20', '21'],
    colors: ['#fbbf24', '#3b82f6']
  },
  {
    id: 8,
    name: 'Men Dark Brown Wallet',
    price: 132,
    oldPrice: null,
    discount: null,
    rating: 4.1,
    reviews: 190,
    stock: 190,
    sold: 212,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400',
    category: 'Wallet',
    sizes: ['S', 'M'],
    colors: ['#78350f', '#1a1a1a']
  }
];

// Product Grid Functions
function initProductGrid() {
  const grid = document.getElementById('productsGrid');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  
  if (!grid) return;
  
  let currentProducts = [...PRODUCTS_DATA];
  
  // Render products
  function renderProducts(products = currentProducts) {
    grid.innerHTML = '';
    
    products.forEach(product => {
      const card = createProductCard(product);
      grid.appendChild(card);
    });
    
    // Update results count
    const resultsInfo = document.querySelector('.results-info');
    if (resultsInfo) {
      resultsInfo.innerHTML = `Hiển thị tất cả <strong>${products.length}</strong> kết quả items`;
    }
  }
  
  // Create product card
  function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => {
      localStorage.setItem('selectedProduct', JSON.stringify(product));
      window.location.href = 'product-details.html';
    };
    
    card.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" />
        ${product.discount ? `<div class="discount-badge">Giảm ${product.discount}%</div>` : ''}
        <div class="wishlist-btn" onclick="event.stopPropagation(); toggleWishlist(this, ${product.id})">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
      </div>
      <div class="product-info">
        <div class="product-name">${product.name}</div>
        <div class="product-rating">
          <svg viewBox="0 0 24 24" fill="currentColor" style="color:#fbbf24">
            <polygon points="12 2 15 8 22 9 17 14 18 21 12 18 6 21 7 14 2 9 9 8"/>
          </svg>
          ${product.rating} <span style="color: var(--muted)">· ${product.reviews} Đánh giá</span>
        </div>
        <div class="product-price">
          <div class="current-price">$${product.price}</div>
          ${product.oldPrice ? `<div class="old-price">$${product.oldPrice}</div>` : ''}
        </div>
        <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${product.id})">
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" stroke-width="2"/>
            <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2"/>
          </svg>
          Thêm vào giỏ hàng
        </button>
      </div>
    `;
    
    return card;
  }
  
  // Search functionality
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      const searchTerm = e.target.value.toLowerCase();
      const filtered = PRODUCTS_DATA.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.category.toLowerCase().includes(searchTerm)
      );
      currentProducts = filtered;
      renderProducts(currentProducts);
    });
  }
  
  // Sort functionality
  if (sortSelect) {
    sortSelect.addEventListener('change', function(e) {
      let sorted = [...currentProducts];
      switch(e.target.value) {
        case 'Giá: Thấp đến Cao':
          sorted.sort((a, b) => a.price - b.price);
          break;
        case 'Giá: Cao đến Thấp':
          sorted.sort((a, b) => b.price - a.price);
          break;
        case 'Đánh giá cao nhất':
          sorted.sort((a, b) => b.rating - a.rating);
          break;
        default:
          sorted = [...PRODUCTS_DATA];
      }
      renderProducts(sorted);
    });
  }
  
  // Filter functionality
  const filterCheckboxes = document.querySelectorAll('.filter-checkbox input[type="checkbox"]');
  filterCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', applyFilters);
  });
  
  function applyFilters() {
    // This is a simple implementation
    // You can enhance it based on your needs
    renderProducts(currentProducts);
  }
  
  // View toggle
  const viewButtons = document.querySelectorAll('.view-btn');
  viewButtons.forEach((btn, index) => {
    btn.addEventListener('click', function() {
      if (index === 1) {
        window.location.href = 'product-list.html';
      }
    });
  });
  
  // Initial render
  renderProducts();
}

// Product Details Functions
function initProductDetails() {
  const savedProduct = localStorage.getItem('selectedProduct');
  
  if (savedProduct) {
    const product = JSON.parse(savedProduct);
    displayProductDetails(product);
  }
  
  // Image gallery
  setupImageGallery();
  
  // Size selection
  setupSizeSelection();
  
  // Color selection
  setupColorSelection();
  
  // Quantity control
  setupQuantityControl();
  
  // Tabs
  setupTabs();
}

function displayProductDetails(product) {
  // Update product title, price, etc.
  const titleElement = document.querySelector('.product-title');
  if (titleElement) titleElement.textContent = product.name;
  
  const priceElement = document.querySelector('.current-price');
  if (priceElement) priceElement.textContent = `$${product.price}`;
  
  // Add more dynamic content updates here
}

function setupImageGallery() {
  window.changeImage = function(src, thumbnail) {
    const mainImage = document.querySelector('#mainImage img');
    if (mainImage) mainImage.src = src;
    
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    thumbnail.classList.add('active');
  };
}

function setupSizeSelection() {
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

function setupColorSelection() {
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

function setupQuantityControl() {
  window.changeQty = function(delta) {
    const input = document.getElementById('qtyInput');
    if (!input) return;
    
    const newValue = parseInt(input.value) + delta;
    if (newValue >= 1) {
      input.value = newValue;
    }
  };
}

function setupTabs() {
  window.switchTab = function(index) {
    document.querySelectorAll('.tab-btn').forEach((btn, i) => {
      btn.classList.toggle('active', i === index);
    });
    document.querySelectorAll('.tab-pane').forEach((pane, i) => {
      pane.classList.toggle('active', i === index);
    });
  };
}

// Wishlist Functions
window.toggleWishlist = function(btn, productId) {
  btn.classList.toggle('active');
  
  let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  
  if (btn.classList.contains('active')) {
    if (!wishlist.includes(productId)) {
      wishlist.push(productId);
    }
    showNotification('Đã thêm vào wishlist! ❤️', 'success');
  } else {
    wishlist = wishlist.filter(id => id !== productId);
    showNotification('Đã xóa khỏi wishlist', 'info');
  }
  
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
};

// Add to Cart Function
window.addToCart = function(productId) {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;
  
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: productId,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  showNotification(`Đã thêm "${product.name}" vào giỏ hàng! 🛒`, 'success');
};

// Update cart badge
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Update badge if exists
  const badge = document.querySelector('.cart-badge');
  if (badge) {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'block' : 'none';
  }
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  const colors = {
    success: { bg: 'linear-gradient(135deg, #10b981, #059669)', icon: '✓' },
    error: { bg: 'linear-gradient(135deg, #ef4444, #dc2626)', icon: '✕' },
    info: { bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', icon: 'ℹ' }
  };
  
  const color = colors[type] || colors.info;
  
  notification.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: ${color.bg};
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideUp 0.3s ease;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: 400px;
  `;
  
  notification.innerHTML = `
    <span style="font-size: 20px;">${color.icon}</span>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp {
      from { transform: translateY(100px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  setTimeout(() => {
    notification.style.animation = 'slideUp 0.3s ease reverse';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  const currentPage = window.location.pathname.split('/').pop();
  
  if (currentPage === 'product-grid.html') {
    initProductGrid();
  } else if (currentPage === 'product-details.html') {
    initProductDetails();
  }
  
  // Load wishlist state
  const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  wishlist.forEach(productId => {
    const btn = document.querySelector(`[onclick*="toggleWishlist"][onclick*="${productId}"]`);
    if (btn) btn.classList.add('active');
  });
  
  // Update cart badge
  updateCartBadge();
});


