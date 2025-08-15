// Product Management JavaScript

// Global variables
let products = [];
let currentUser = null;
let selectedImage = null;

// Initialize the product manager
document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  loadUserData();
  loadProducts();
  setupEventListeners();
  updateStats();
});

// Check if user is authenticated and is a professional
function checkAuth() {
  const userData = localStorage.getItem('herculesUser');
  if (!userData) {
    window.location.href = 'login.html';
    return;
  }
  
  const user = JSON.parse(userData);
  if (user.userType !== 'professional') {
    alert('Access denied. This feature is only available for professional accounts.');
    window.location.href = 'dashboard-client.html';
    return;
  }
  
  currentUser = user;
}

// Load user data
function loadUserData() {
  if (!currentUser) return;
  
  // Update user name displays
  const userNameElements = document.querySelectorAll('#userName, #userNameHeader');
  const displayName = currentUser.firstName || currentUser.email.split('@')[0];
  
  userNameElements.forEach(element => {
    if (element) {
      element.textContent = displayName;
    }
  });
}

// Setup event listeners
function setupEventListeners() {
  // Product form
  const productForm = document.getElementById('productForm');
  if (productForm) {
    productForm.addEventListener('submit', function(e) {
      e.preventDefault();
      addProduct();
    });
  }
  
  // Image upload drag and drop
  const imageUpload = document.getElementById('imageUpload');
  if (imageUpload) {
    imageUpload.addEventListener('dragover', handleDragOver);
    imageUpload.addEventListener('drop', handleDrop);
    imageUpload.addEventListener('dragleave', handleDragLeave);
  }
}

// Show tab content
function showTab(tabName) {
  // Hide all tab contents
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(content => {
    content.classList.remove('active');
  });
  
  // Remove active class from all tab buttons
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab content
  const selectedTab = document.getElementById(tabName);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }
  
  // Add active class to clicked button
  const clickedButton = event.target;
  clickedButton.classList.add('active');
}

// Handle image upload
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    processImageFile(file);
  }
}

// Handle drag and drop
function handleDragOver(event) {
  event.preventDefault();
  event.currentTarget.classList.add('dragover');
}

function handleDragLeave(event) {
  event.currentTarget.classList.remove('dragover');
}

function handleDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.remove('dragover');
  
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    processImageFile(files[0]);
  }
}

// Process image file
function processImageFile(file) {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file.');
    return;
  }
  
  // Validate file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    alert('Image size should be less than 5MB.');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    selectedImage = e.target.result;
    
    // Update preview
    const imagePreview = document.getElementById('imagePreview');
    const uploadText = document.getElementById('uploadText');
    
    if (imagePreview && uploadText) {
      imagePreview.src = selectedImage;
      imagePreview.style.display = 'block';
      uploadText.style.display = 'none';
    }
  };
  reader.readAsDataURL(file);
}

// Add new product
function addProduct() {
  const productName = document.getElementById('productName').value.trim();
  const productPrice = parseFloat(document.getElementById('productPrice').value);
  const productCategory = document.getElementById('productCategory').value;
  const productStock = parseInt(document.getElementById('productStock').value);
  const productDescription = document.getElementById('productDescription').value.trim();
  
  if (!productName || isNaN(productPrice) || productPrice <= 0 || !productCategory || isNaN(productStock) || productStock < 0 || !productDescription) {
    alert('Please fill in all fields correctly!');
    return;
  }
  
  if (!selectedImage) {
    alert('Please upload a product image!');
    return;
  }
  
  // Create product object
  const product = {
    id: Date.now(),
    name: productName,
    price: productPrice,
    category: productCategory,
    stock: productStock,
    description: productDescription,
    image: selectedImage,
    sellerId: currentUser.email,
    sellerName: currentUser.firstName || currentUser.email.split('@')[0],
    createdAt: new Date().toISOString(),
    views: 0,
    status: 'active'
  };
  
  // Add to products array
  products.push(product);
  
  // Save to localStorage
  saveProducts();
  
  // Update display
  updateProductsGrid();
  updateStats();
  
  // Reset form
  resetForm();
  
  // Show success message
  showNotification(`✅ Product "${productName}" added successfully!`);
  
  // Switch to My Products tab
  showTab('my-products');
}

// Reset form
function resetForm() {
  document.getElementById('productForm').reset();
  selectedImage = null;
  
  const imagePreview = document.getElementById('imagePreview');
  const uploadText = document.getElementById('uploadText');
  
  if (imagePreview && uploadText) {
    imagePreview.style.display = 'none';
    uploadText.style.display = 'block';
  }
}

// Load products from localStorage
function loadProducts() {
  const savedProducts = localStorage.getItem('products');
  if (savedProducts) {
    try {
      products = JSON.parse(savedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      products = [];
    }
  }
}

// Save products to localStorage
function saveProducts() {
  localStorage.setItem('products', JSON.stringify(products));
}

// Update products grid display
function updateProductsGrid() {
  const productsGrid = document.getElementById('productsGrid');
  if (!productsGrid) return;
  
  // Filter products for current user
  const userProducts = products.filter(product => product.sellerId === currentUser.email);
  
  if (userProducts.length === 0) {
    productsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #666;">
        <span style="font-size: 3rem;">📦</span>
        <p>No products yet. Add your first product to start promoting!</p>
      </div>
    `;
    return;
  }
  
  productsGrid.innerHTML = '';
  
  userProducts.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">
      </div>
      <div class="product-info">
        <div class="product-title">${product.name}</div>
        <div class="product-description">${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}</div>
        <div class="product-price">৳${product.price.toLocaleString()}</div>
        <div class="product-category">${getCategoryDisplayName(product.category)}</div>
        <div style="margin-bottom: 1rem; font-size: 0.9rem; color: #666;">
          Stock: ${product.stock} | Views: ${product.views}
        </div>
        <div class="product-actions">
          <button class="edit-btn" onclick="editProduct(${product.id})">Edit</button>
          <button class="delete-btn" onclick="deleteProduct(${product.id})">Delete</button>
        </div>
      </div>
    `;
    productsGrid.appendChild(productCard);
  });
}

// Get category display name
function getCategoryDisplayName(category) {
  const categories = {
    'supplements': 'Supplements',
    'equipment': 'Fitness Equipment',
    'clothing': 'Workout Clothing',
    'nutrition': 'Nutrition Products',
    'services': 'Training Services',
    'other': 'Other'
  };
  return categories[category] || category;
}

// Edit product
function editProduct(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  // Populate form with product data
  document.getElementById('productName').value = product.name;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productCategory').value = product.category;
  document.getElementById('productStock').value = product.stock;
  document.getElementById('productDescription').value = product.description;
  
  // Set image
  selectedImage = product.image;
  const imagePreview = document.getElementById('imagePreview');
  const uploadText = document.getElementById('uploadText');
  
  if (imagePreview && uploadText) {
    imagePreview.src = selectedImage;
    imagePreview.style.display = 'block';
    uploadText.style.display = 'none';
  }
  
  // Switch to Add Product tab
  showTab('add-product');
  
  // Update form button
  const addBtn = document.querySelector('.add-btn');
  if (addBtn) {
    addBtn.textContent = 'Update Product';
    addBtn.onclick = function(e) {
      e.preventDefault();
      updateProduct(productId);
    };
  }
}

// Update product
function updateProduct(productId) {
  const productIndex = products.findIndex(p => p.id === productId);
  if (productIndex === -1) return;
  
  const productName = document.getElementById('productName').value.trim();
  const productPrice = parseFloat(document.getElementById('productPrice').value);
  const productCategory = document.getElementById('productCategory').value;
  const productStock = parseInt(document.getElementById('productStock').value);
  const productDescription = document.getElementById('productDescription').value.trim();
  
  if (!productName || isNaN(productPrice) || productPrice <= 0 || !productCategory || isNaN(productStock) || productStock < 0 || !productDescription) {
    alert('Please fill in all fields correctly!');
    return;
  }
  
  // Update product
  products[productIndex] = {
    ...products[productIndex],
    name: productName,
    price: productPrice,
    category: productCategory,
    stock: productStock,
    description: productDescription,
    image: selectedImage || products[productIndex].image,
    updatedAt: new Date().toISOString()
  };
  
  // Save and update
  saveProducts();
  updateProductsGrid();
  updateStats();
  resetForm();
  
  // Reset form button
  const addBtn = document.querySelector('.add-btn');
  if (addBtn) {
    addBtn.textContent = 'Add Product';
    addBtn.onclick = null;
  }
  
  showNotification(`✅ Product "${productName}" updated successfully!`);
}

// Delete product
function deleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  
  const productIndex = products.findIndex(p => p.id === productId);
  if (productIndex === -1) return;
  
  const productName = products[productIndex].name;
  products.splice(productIndex, 1);
  
  saveProducts();
  updateProductsGrid();
  updateStats();
  
  showNotification(`🗑️ Product "${productName}" deleted successfully!`);
}

// Update statistics
function updateStats() {
  const userProducts = products.filter(product => product.sellerId === currentUser.email);
  const activeProducts = userProducts.filter(product => product.status === 'active');
  const totalViews = userProducts.reduce((sum, product) => sum + product.views, 0);
  const totalRevenue = userProducts.reduce((sum, product) => sum + (product.price * 0), 0); // Placeholder for actual sales
  
  document.getElementById('totalProducts').textContent = userProducts.length;
  document.getElementById('activeProducts').textContent = activeProducts.length;
  document.getElementById('totalViews').textContent = totalViews.toLocaleString();
  document.getElementById('totalRevenue').textContent = `৳${totalRevenue.toLocaleString()}`;
}

// Export products
function exportProducts() {
  const userProducts = products.filter(product => product.sellerId === currentUser.email);
  
  if (userProducts.length === 0) {
    alert('No products to export!');
    return;
  }
  
  const data = {
    exportDate: new Date().toISOString(),
    seller: currentUser.email,
    products: userProducts.map(product => ({
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      description: product.description,
      views: product.views,
      status: product.status,
      createdAt: product.createdAt
    }))
  };
  
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `products-${currentUser.email}-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
  showNotification('Products exported successfully!');
}

// Show notification
function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Logout function
function logout() {
  localStorage.removeItem('herculesUser');
  window.location.href = 'index.html';
}

// Initialize display
updateProductsGrid();
