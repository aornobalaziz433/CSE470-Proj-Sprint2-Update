// Community JavaScript

// Global variables
let posts = [];
let filteredPosts = [];
let currentUser = null;
let showingMyPosts = false;

// Initialize the community
document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  loadPosts();
  setupEventListeners();
  displayPosts();
  displayCommunitySummary();
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

// Load posts from localStorage
function loadPosts() {
  const savedPosts = localStorage.getItem('communityPosts');
  if (savedPosts) {
    try {
      posts = JSON.parse(savedPosts);
      // Only show active posts
      posts = posts.filter(post => post.status === 'active');
    } catch (error) {
      console.error('Error loading posts:', error);
      posts = [];
    }
  }
  
  // If no posts exist, start with empty array
  if (posts.length === 0) {
    posts = [];
    localStorage.setItem('communityPosts', JSON.stringify(posts));
  }
  
  filteredPosts = [...posts];
}

// Setup event listeners
function setupEventListeners() {
  // Search functionality
  const searchInput = document.getElementById('searchPosts');
  if (searchInput) {
    searchInput.addEventListener('input', filterPosts);
  }
  
  // Category filter
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', filterPosts);
  }
  
  // Modal close on outside click
  const modal = document.getElementById('postModal');
  if (modal) {
    modal.addEventListener('click', function(event) {
      if (event.target === modal) {
        closeModal();
      }
    });
  }
  
  const createModal = document.getElementById('createPostModal');
  if (createModal) {
    createModal.addEventListener('click', function(event) {
      if (event.target === createModal) {
        closeCreatePostModal();
      }
    });
  }
}

// Filter posts based on search and filters
function filterPosts() {
  const searchTerm = document.getElementById('searchPosts').value.toLowerCase();
  const category = document.getElementById('categoryFilter').value;
  
  filteredPosts = posts.filter(post => {
    // Search filter
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm) ||
      post.description.toLowerCase().includes(searchTerm) ||
      post.authorName.toLowerCase().includes(searchTerm);
    
    // Category filter
    const matchesCategory = !category || post.category === category;
    
    return matchesSearch && matchesCategory;
  });
  
  displayPosts();
  displayCommunitySummary();
}

// Clear all filters
function clearFilters() {
  document.getElementById('searchPosts').value = '';
  document.getElementById('categoryFilter').value = '';
  
  filteredPosts = [...posts];
  displayPosts();
  displayCommunitySummary();
}

// Display posts in the grid
function displayPosts() {
  const postsGrid = document.getElementById('postsGrid');
  if (!postsGrid) return;
  
  if (filteredPosts.length === 0) {
    postsGrid.innerHTML = `
      <div class="no-posts" style="grid-column: 1 / -1;">
        <span>Search</span>
        <p>No posts found matching your criteria.</p>
        <p>Try adjusting your filters or search terms.</p>
      </div>
    `;
    return;
  }
  
  postsGrid.innerHTML = '';
  
  filteredPosts.forEach(post => {
    const postCard = document.createElement('div');
    postCard.className = 'post-card';
    postCard.onclick = () => openPostModal(post);
    
    // Format timestamp
    const timestamp = formatTimestamp(post.createdAt);
    
    // Check if user has liked this post
    const isLiked = post.likedBy && post.likedBy.includes(currentUser.email || currentUser.id);
    
    postCard.innerHTML = `
      <div class="post-header">
        <div class="post-author-avatar">${post.authorName.charAt(0).toUpperCase()}</div>
        <div class="post-author-info">
          <div class="post-author-name">${post.authorName}</div>
          <div class="post-timestamp">${timestamp}</div>
        </div>
        <div class="post-category">${getCategoryDisplayName(post.category)}</div>
      </div>
      <div class="post-content">
        <div class="post-title">${post.title}</div>
        <div class="post-description">${post.description.substring(0, 150)}${post.description.length > 150 ? '...' : ''}</div>
        ${post.beforeImage && post.afterImage ? `
          <div class="transformation-images">
            <div class="transformation-image">
              <img src="${post.beforeImage}" alt="Before" onerror="this.src='https://via.placeholder.com/400x400/f5f5f5/666?text=Before'">
              <div class="image-label">Before</div>
            </div>
            <div class="transformation-image">
              <img src="${post.afterImage}" alt="After" onerror="this.src='https://via.placeholder.com/400x400/f5f5f5/666?text=After'">
              <div class="image-label">After</div>
            </div>
          </div>
        ` : ''}
        <div class="post-actions">
          <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="event.stopPropagation(); toggleLike('${post.id}')">
            ${isLiked ? 'Liked' : 'Like'} ${post.likes || 0}
          </button>
          <button class="action-btn" onclick="event.stopPropagation(); openPostModal(${JSON.stringify(post).replace(/"/g, '&quot;')})">
            View ${post.views || 0}
          </button>
          ${post.authorId === (currentUser.email || currentUser.id) ? 
            `<button class="delete-btn" onclick="event.stopPropagation(); deletePost('${post.id}')">Delete</button>` : 
            ''
          }
        </div>
      </div>
    `;
    postsGrid.appendChild(postCard);
  });
}

// Display community summary
function displayCommunitySummary() {
  const summaryContainer = document.getElementById('communitySummary');
  if (!summaryContainer) return;
  
  const totalPosts = posts.length;
  const userPosts = posts.filter(post => post.authorId === (currentUser.email || currentUser.id));
  const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
  const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
  
      summaryContainer.innerHTML = `
      <h3>Community Summary</h3>
      <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-number">${totalPosts}</div>
        <div class="summary-label">Total Posts</div>
      </div>
      <div class="summary-card">
        <div class="summary-number">${userPosts.length}</div>
        <div class="summary-label">Your Posts</div>
      </div>
      <div class="summary-card">
        <div class="summary-number">${totalLikes}</div>
        <div class="summary-label">Total Likes</div>
      </div>
      <div class="summary-card">
        <div class="summary-number">${totalViews}</div>
        <div class="summary-label">Total Views</div>
      </div>
    </div>
  `;
}

// Get category display name
function getCategoryDisplayName(category) {
  const categories = {
    'transformation': 'Transformation Journey',
    'opinion': 'Opinion & Advice',
    'suggestion': 'Suggestions & Tips',
    'motivation': 'Motivation & Inspiration',
    'question': 'Questions & Help',
    'other': 'Other'
  };
  return categories[category] || category;
}

// Format timestamp
function formatTimestamp(timestamp) {
  const now = new Date();
  const postDate = new Date(timestamp);
  const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
}

// Open post modal
function openPostModal(post) {
  // Increment view count
  incrementPostViews(post.id);
  
  const modal = document.getElementById('postModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  
  if (!modal || !modalTitle || !modalBody) return;
  
  modalTitle.textContent = post.title;
  
  const timestamp = formatTimestamp(post.createdAt);
  const isLiked = post.likedBy && post.likedBy.includes(currentUser.email || currentUser.id);
  
  modalBody.innerHTML = `
    ${post.beforeImage && post.afterImage ? `
      <div class="modal-transformation-images">
        <div class="modal-transformation-image">
          <img src="${post.beforeImage}" alt="Before" onerror="this.src='https://via.placeholder.com/400x400/f5f5f5/666?text=Before'">
          <div class="image-label">Before</div>
        </div>
        <div class="modal-transformation-image">
          <img src="${post.afterImage}" alt="After" onerror="this.src='https://via.placeholder.com/400x400/f5f5f5/666?text=After'">
          <div class="image-label">After</div>
        </div>
      </div>
    ` : ''}
    <div class="modal-description">${post.description}</div>
    <div class="modal-author">
      <h4>Author Information</h4>
      <p><strong>Name:</strong> ${post.authorName}</p>
      <p><strong>Category:</strong> ${getCategoryDisplayName(post.category)}</p>
      <p><strong>Posted:</strong> ${timestamp}</p>
      <p><strong>Likes:</strong> ${post.likes || 0} | <strong>Views:</strong> ${post.views || 0}</p>
    </div>
    <div class="modal-actions">
      <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike('${post.id}')">
        ${isLiked ? 'Liked' : 'Like'} (${post.likes || 0})
      </button>
      ${post.authorId === (currentUser.email || currentUser.id) ? 
        `<button class="modal-btn primary" onclick="deletePost('${post.id}')">Delete Post</button>` : 
        `<button class="modal-btn primary" onclick="closeModal()">Close</button>`
      }
    </div>
  `;
  
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

// Close post modal
function closeModal() {
  const modal = document.getElementById('postModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// Open create post modal
function openCreatePostModal() {
  const modal = document.getElementById('createPostModal');
  if (modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Reset form
    document.getElementById('createPostForm').reset();
  }
}

// Close create post modal
function closeCreatePostModal() {
  const modal = document.getElementById('createPostModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// Submit new post
function submitPost(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const postData = {
    title: formData.get('postTitle'),
    category: formData.get('postCategory'),
    description: formData.get('postDescription'),
    beforeImage: formData.get('beforeImage'),
    afterImage: formData.get('afterImage')
  };
  
  // Validate required fields
  if (!postData.title || !postData.category || !postData.description) {
    alert('Please fill in all required fields.');
    return;
  }
  
  // Create new post object
  const newPost = {
    id: Date.now().toString(),
    ...postData,
    authorId: currentUser.email || currentUser.id,
    authorName: currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : currentUser.email,
    status: 'active',
    likes: 0,
    views: 0,
    likedBy: [],
    createdAt: new Date().toISOString()
  };
  
  // Add to posts array
  posts.push(newPost);
  filteredPosts = [...posts];
  
  // Save to localStorage
  const allPosts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
  allPosts.push(newPost);
  localStorage.setItem('communityPosts', JSON.stringify(allPosts));
  
  // Update display
  displayPosts();
  displayCommunitySummary();
  
  // Close modal and show success message
  closeCreatePostModal();
  alert(`Post "${newPost.title}" created successfully!`);
}

// Toggle between all posts and user's posts
function toggleMyPosts() {
  showingMyPosts = !showingMyPosts;
  const myPostsBtn = document.querySelector('.my-posts-btn');
  
  if (myPostsBtn) {
    if (showingMyPosts) {
      myPostsBtn.classList.add('active');
      myPostsBtn.textContent = 'All Posts';
      // Show only user's posts
      filteredPosts = posts.filter(post => post.authorId === (currentUser.email || currentUser.id));
    } else {
      myPostsBtn.classList.remove('active');
      myPostsBtn.textContent = 'My Posts';
      // Show all posts
      filteredPosts = [...posts];
    }
  }
  
  displayPosts();
  displayCommunitySummary();
}

// Toggle like on a post
function toggleLike(postId) {
  const postIndex = posts.findIndex(p => p.id === postId);
  if (postIndex === -1) return;
  
  const post = posts[postIndex];
  const userId = currentUser.email || currentUser.id;
  
  // Initialize likedBy array if it doesn't exist
  if (!post.likedBy) {
    post.likedBy = [];
  }
  
  const userLikedIndex = post.likedBy.indexOf(userId);
  
  if (userLikedIndex === -1) {
    // User hasn't liked this post, add like
    post.likedBy.push(userId);
    post.likes = (post.likes || 0) + 1;
  } else {
    // User has already liked this post, remove like
    post.likedBy.splice(userLikedIndex, 1);
    post.likes = Math.max(0, (post.likes || 0) - 1);
  }
  
  // Update localStorage
  const allPosts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
  const allPostIndex = allPosts.findIndex(p => p.id === postId);
  if (allPostIndex !== -1) {
    allPosts[allPostIndex] = post;
    localStorage.setItem('communityPosts', JSON.stringify(allPosts));
  }
  
  // Update display
  displayPosts();
  displayCommunitySummary();
}

// Delete post (only for user's own posts)
function deletePost(postId) {
  if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
    return;
  }
  
  // Remove from posts array
  const postIndex = posts.findIndex(p => p.id === postId);
  if (postIndex !== -1) {
    const deletedPost = posts[postIndex];
    posts.splice(postIndex, 1);
    
    // Update filtered posts
    if (showingMyPosts) {
      filteredPosts = posts.filter(post => post.authorId === (currentUser.email || currentUser.id));
    } else {
      filteredPosts = [...posts];
    }
    
    // Update localStorage
    const allPosts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
    const allPostIndex = allPosts.findIndex(p => p.id === postId);
    if (allPostIndex !== -1) {
      allPosts.splice(allPostIndex, 1);
      localStorage.setItem('communityPosts', JSON.stringify(allPosts));
    }
    
    // Update display
    displayPosts();
    displayCommunitySummary();
    
    // Close modal if open
    closeModal();
    
    alert(`Post "${deletedPost.title}" has been deleted successfully.`);
  }
}

// Increment post views
function incrementPostViews(postId) {
  const postIndex = posts.findIndex(p => p.id === postId);
  if (postIndex !== -1) {
    posts[postIndex].views = (posts[postIndex].views || 0) + 1;
    
    // Update localStorage
    const allPosts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
    const allPostIndex = allPosts.findIndex(p => p.id === postId);
    if (allPostIndex !== -1) {
      allPosts[allPostIndex].views = (allPosts[allPostIndex].views || 0) + 1;
      localStorage.setItem('communityPosts', JSON.stringify(allPosts));
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
    closeCreatePostModal();
  }
  
  // Ctrl/Cmd + F to focus search
  if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
    event.preventDefault();
    const searchInput = document.getElementById('searchPosts');
    if (searchInput) {
      searchInput.focus();
    }
  }
  
  // Ctrl/Cmd + N to open create post modal
  if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
    event.preventDefault();
    openCreatePostModal();
  }
});
