// Product Marketplace JavaScript

// Global variables
let products = [];
let filteredProducts = [];
let currentUser = null;
let showingMyProducts = false;

// Initialize the marketplace
document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  loadProducts();
  setupEventListeners();
  displayProducts();
  displayProductsSummary();
});

// Check if user is authenticated
function checkAuth() {
  const userData = localStorage.getItem('herculesUser');
  if (!userData) {
    window.location.href = 'login.html';
    return;
  }
  
  currentUser = JSON.parse(userData);
}

// Load products from localStorage
function loadProducts() {
  const savedProducts = localStorage.getItem('products');
  if (savedProducts) {
    try {
      products = JSON.parse(savedProducts);
      // Only show active products
      products = products.filter(product => product.status === 'active');
    } catch (error) {
      console.error('Error loading products:', error);
      products = [];
    }
  }
  
  // If no products exist, add some sample products
  if (products.length === 0) {
    products = [
      {
        id: '1',
        name: 'Whey Protein Isolate',
        category: 'supplements',
        price: 2500,
        stock: 50,
        description: 'High-quality whey protein isolate for muscle building and recovery. 25g protein per serving, low in carbs and fat.',
        image: 'https://via.placeholder.com/400x300/f5f5f5/666?text=Whey+Protein',
        contact: 'supplements@herculespro.com',
        sellerId: 'supplements@herculespro.com',
        sellerName: 'Hercules Pro Supplements',
        status: 'active',
        views: 15,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Organic Quinoa Bowl',
        category: 'nutrition',
        price: 350,
        stock: 25,
        description: 'Nutritious organic quinoa bowl with fresh vegetables and lean protein. Perfect for post-workout nutrition.',
        image: 'https://via.placeholder.com/400x300/f5f5f5/666?text=Quinoa+Bowl',
        contact: 'nutrition@herculespro.com',
        sellerId: 'nutrition@herculespro.com',
        sellerName: 'Hercules Pro Nutrition',
        status: 'active',
        views: 8,
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Premium Gym Membership',
        category: 'gym-membership',
        price: 5000,
        stock: 100,
        description: 'Premium gym membership with access to all facilities, personal training sessions, and nutrition consultation.',
        image: 'https://via.placeholder.com/400x300/f5f5f5/666?text=Gym+Membership',
        contact: 'membership@herculespro.com',
        sellerId: 'membership@herculespro.com',
        sellerName: 'Hercules Pro Gym',
        status: 'active',
        views: 22,
        createdAt: new Date().toISOString()
      }
    ];
    
    // Save sample products to localStorage
    localStorage.setItem('products', JSON.stringify(products));
  }
  
  filteredProducts = [...products];
}

// Setup event listeners
function setupEventListeners() {
  // Search functionality
  const searchInput = document.getElementById('searchProducts');
  if (searchInput) {
    searchInput.addEventListener('input', filterProducts);
  }
  
  // Category filter
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', filterProducts);
  }
  
  // Price filters
  const priceMin = document.getElementById('priceMin');
  const priceMax = document.getElementById('priceMax');
  if (priceMin) {
    priceMin.addEventListener('input', filterProducts);
  }
  if (priceMax) {
    priceMax.addEventListener('input', filterProducts);
  }
  
  // Modal close on outside click
  const modal = document.getElementById('productModal');
  if (modal) {
    modal.addEventListener('click', function(event) {
      if (event.target === modal) {
        closeModal();
      }
    });
  }
}

// Filter products based on search and filters
function filterProducts() {
  const searchTerm = document.getElementById('searchProducts').value.toLowerCase();
  const category = document.getElementById('categoryFilter').value;
  const minPrice = parseFloat(document.getElementById('priceMin').value) || 0;
  const maxPrice = parseFloat(document.getElementById('priceMax').value) || Infinity;
  
  filteredProducts = products.filter(product => {
    // Search filter
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.sellerName.toLowerCase().includes(searchTerm);
    
    // Category filter
    const matchesCategory = !category || product.category === category;
    
    // Price filter
    const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
    
    return matchesSearch && matchesCategory && matchesPrice;
  });
  
  displayProducts();
  displayProductsSummary();
}

// Clear all filters
function clearFilters() {
  document.getElementById('searchProducts').value = '';
  document.getElementById('categoryFilter').value = '';
  document.getElementById('priceMin').value = '';
  document.getElementById('priceMax').value = '';
  
  filteredProducts = [...products];
  displayProducts();
  displayProductsSummary();
}

// Display products in the grid
function displayProducts() {
  const productsGrid = document.getElementById('productsGrid');
  if (!productsGrid) return;
  
  if (filteredProducts.length === 0) {
    productsGrid.innerHTML = `
      <div class="no-products" style="grid-column: 1 / -1;">
        <span>Search</span>
        <p>No products found matching your criteria.</p>
        <p>Try adjusting your filters or search terms.</p>
      </div>
    `;
    return;
  }
  
  productsGrid.innerHTML = '';
  
  filteredProducts.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.onclick = () => openProductModal(product);
    
    productCard.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">
      </div>
      <div class="product-info">
        <div class="product-title">${product.name}</div>
        <div class="product-description">${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}</div>
        <div class="product-price">৳${product.price.toLocaleString()}</div>
        <div class="product-category">${getCategoryDisplayName(product.category)}</div>
        <div class="seller-info">
          <div class="seller-avatar">${product.sellerName.charAt(0).toUpperCase()}</div>
          <span>by ${product.sellerName}</span>
        </div>
        <div class="product-actions">
          <button class="view-btn" onclick="event.stopPropagation(); openProductModal(${JSON.stringify(product).replace(/"/g, '&quot;')})">View Details</button>
          ${product.sellerId === (currentUser.email || currentUser.id) ? 
            `<button class="delete-btn" onclick="event.stopPropagation(); deleteProduct('${product.id}')">Delete</button>` : 
            `<button class="contact-btn" onclick="event.stopPropagation(); contactSeller('${product.sellerId}', '${product.name}')">Contact Seller</button>`
          }
        </div>
      </div>
    `;
    productsGrid.appendChild(productCard);
  });
}

// Display products summary
function displayProductsSummary() {
  const summaryContainer = document.getElementById('productsSummary');
  if (!summaryContainer) return;
  
  const totalProducts = products.length;
  const userProducts = products.filter(product => product.sellerId === (currentUser.email || currentUser.id));
  const totalViews = products.reduce((sum, product) => sum + product.views, 0);
  const userViews = userProducts.reduce((sum, product) => sum + product.views, 0);
  
      summaryContainer.innerHTML = `
      <h3>Marketplace Summary</h3>
      <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-number">${totalProducts}</div>
        <div class="summary-label">Total Products</div>
      </div>
      <div class="summary-card">
        <div class="summary-number">${userProducts.length}</div>
        <div class="summary-label">Your Products</div>
      </div>
      <div class="summary-card">
        <div class="summary-number">${totalViews}</div>
        <div class="summary-label">Total Views</div>
      </div>
      <div class="summary-card">
        <div class="summary-number">${userViews}</div>
        <div class="summary-label">Your Product Views</div>
      </div>
    </div>
  `;
}

// Get category display name
function getCategoryDisplayName(category) {
  const categories = {
    'supplements': 'Supplements',
    'nutrition': 'Nutrition Products',
    'gym-membership': 'Gym Membership Service',
    'equipment': 'Fitness Equipment',
    'clothing': 'Workout Clothing',
    'services': 'Training Services',
    'other': 'Other'
  };
  return categories[category] || category;
}

// Open product modal
function openProductModal(product) {
  // Increment view count
  incrementProductViews(product.id);
  
  const modal = document.getElementById('productModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  
  if (!modal || !modalTitle || !modalBody) return;
  
  modalTitle.textContent = product.name;
  
  modalBody.innerHTML = `
    <img src="${product.image}" alt="${product.name}" class="modal-image">
    <div class="modal-price">৳${product.price.toLocaleString()}</div>
    <div class="modal-description">${product.description}</div>
    <div class="modal-seller">
      <h4>Seller Information</h4>
      <p><strong>Name:</strong> ${product.sellerName}</p>
      <p><strong>Category:</strong> ${getCategoryDisplayName(product.category)}</p>
      <p><strong>Stock:</strong> ${product.stock} units available</p>
      <p><strong>Views:</strong> ${product.views} people have viewed this product</p>
    </div>
    <div class="modal-actions">
      ${product.sellerId === (currentUser.email || currentUser.id) ? 
        `<button class="modal-btn primary" onclick="deleteProduct('${product.id}')">Delete Product</button>` : 
        `<button class="modal-btn primary" onclick="contactSeller('${product.sellerId}', '${product.name}')">Contact Seller</button>`
      }
      <button class="modal-btn secondary" onclick="closeModal()">Close</button>
    </div>
  `;
  
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

// Close product modal
function closeModal() {
  const modal = document.getElementById('productModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// Open add product modal
function openAddProductModal() {
  const modal = document.getElementById('addProductModal');
  if (modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Reset form
    document.getElementById('addProductForm').reset();
    
    // Set default image if none provided
    const imageInput = document.getElementById('productImage');
    if (imageInput && !imageInput.value) {
      imageInput.value = 'https://via.placeholder.com/400x300/f5f5f5/666?text=Product+Image';
    }
  }
}

// Close add product modal
function closeAddProductModal() {
  const modal = document.getElementById('addProductModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// Submit new product
function submitProduct(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const productData = {
    name: formData.get('productName'),
    category: formData.get('productCategory'),
    price: parseFloat(formData.get('productPrice')),
    stock: parseInt(formData.get('productStock')),
    description: formData.get('productDescription'),
    image: formData.get('productImage') || 'https://via.placeholder.com/400x300/f5f5f5/666?text=Product+Image',
    contact: formData.get('productContact')
  };
  
  // Validate required fields
  if (!productData.name || !productData.category || !productData.price || !productData.stock || !productData.description || !productData.contact) {
    alert('Please fill in all required fields.');
    return;
  }
  
  // Create new product object
  const newProduct = {
    id: Date.now().toString(),
    ...productData,
    sellerId: currentUser.email || currentUser.id,
    sellerName: currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : currentUser.email,
    status: 'active',
    views: 0,
    createdAt: new Date().toISOString()
  };
  
  // Add to products array
  products.push(newProduct);
  filteredProducts = [...products];
  
  // Save to localStorage
  const allProducts = JSON.parse(localStorage.getItem('products') || '[]');
  allProducts.push(newProduct);
  localStorage.setItem('products', JSON.stringify(allProducts));
  
  // Update display
  displayProducts();
  displayProductsSummary();
  
  // Close modal and show success message
  closeAddProductModal();
  alert(`Product "${newProduct.name}" added successfully!`);
}

// Toggle between all products and user's products
function toggleMyProducts() {
  showingMyProducts = !showingMyProducts;
  const myProductsBtn = document.querySelector('.my-products-btn');
  
  if (myProductsBtn) {
    if (showingMyProducts) {
      myProductsBtn.classList.add('active');
      myProductsBtn.textContent = 'All Products';
      // Show only user's products
      filteredProducts = products.filter(product => product.sellerId === (currentUser.email || currentUser.id));
    } else {
      myProductsBtn.classList.remove('active');
      myProductsBtn.textContent = 'My Products';
      // Show all products
      filteredProducts = [...products];
    }
  }
  
  displayProducts();
  displayProductsSummary();
}

// Delete product (only for user's own products)
function deleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
    return;
  }
  
  // Remove from products array
  const productIndex = products.findIndex(p => p.id === productId);
  if (productIndex !== -1) {
    const deletedProduct = products[productIndex];
    products.splice(productIndex, 1);
    
    // Update filtered products
    if (showingMyProducts) {
      filteredProducts = products.filter(product => product.sellerId === (currentUser.email || currentUser.id));
    } else {
      filteredProducts = [...products];
    }
    
    // Update localStorage
    const allProducts = JSON.parse(localStorage.getItem('products') || '[]');
    const allProductIndex = allProducts.findIndex(p => p.id === productId);
    if (allProductIndex !== -1) {
      allProducts.splice(allProductIndex, 1);
      localStorage.setItem('products', JSON.stringify(allProducts));
    }
    
    // Update display
    displayProducts();
    displayProductsSummary();
    
    alert(`Product "${deletedProduct.name}" has been deleted successfully.`);
  }
}

// Contact seller
function contactSeller(sellerId, productName) {
  const userData = localStorage.getItem('herculesUser');
  if (!userData) {
    alert('Please log in to contact sellers.');
    return;
  }
  
  const user = JSON.parse(userData);
  
  // Create a simple contact form (in a real app, this would open a chat or email form)
  const contactInfo = `
Contact Information for "${productName}"

Seller ID: ${sellerId}
Your Email: ${user.email}
Your Name: ${user.firstName || user.email.split('@')[0]}

To contact the seller, you can:
1. Send them an email at: ${sellerId}
2. Use the messaging system (coming soon)
3. Call them if they've provided a phone number

Would you like to copy the seller's email address?
  `;
  
  if (confirm(contactInfo)) {
    // Copy seller email to clipboard
    navigator.clipboard.writeText(sellerId).then(() => {
      alert('Seller email copied to clipboard!');
    }).catch(() => {
      alert(`Seller email: ${sellerId}`);
    });
  }
  
  closeModal();
}

// Increment product views
function incrementProductViews(productId) {
  const productIndex = products.findIndex(p => p.id === productId);
  if (productIndex !== -1) {
    products[productIndex].views += 1;
    
    // Update localStorage
    const allProducts = JSON.parse(localStorage.getItem('products') || '[]');
    const allProductIndex = allProducts.findIndex(p => p.id === productId);
    if (allProductIndex !== -1) {
      allProducts[allProductIndex].views += 1;
      localStorage.setItem('products', JSON.stringify(allProducts));
    }
  }
}

// Logout function
function logout() {
  localStorage.removeItem('herculesUser');
  window.location.href = 'index.html';
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
  // Escape key to close modals
  if (event.key === 'Escape') {
    closeModal();
    closeAddProductModal();
  }
  
  // Ctrl/Cmd + F to focus search
  if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
    event.preventDefault();
    const searchInput = document.getElementById('searchProducts');
    if (searchInput) {
      searchInput.focus();
    }
  }
  
  // Ctrl/Cmd + N to open add product modal
  if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
    event.preventDefault();
    openAddProductModal();
  }
});
