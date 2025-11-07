// Dashboard JavaScript
// Dùng cho dashboard.html

// Sample dashboard data
const DASHBOARD_DATA = {
  stats: {
    revenue: { value: 458320, change: 12.5, trend: 'up', prefix: '$' },
    customers: { value: 12456, change: 8.2, trend: 'up' },
    orders: { value: 8234, change: 15.3, trend: 'up' },
    products: { value: 5786, change: -2.4, trend: 'down' }
  },
  monthlyRevenue: {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10'],
    data2024: [45, 55, 68, 75, 82, 90, 70, 85, 92, 100],
    data2023: [35, 48, 52, 65, 70, 78, 60, 72, 82, 88]
  },
  categoryDistribution: [
    { name: 'Thời trang', percentage: 35, color: '#ff8f3d' },
    { name: 'Điện tử', percentage: 30, color: '#3b82f6' },
    { name: 'Nội thất', percentage: 20, color: '#10b981' },
    { name: 'Khác', percentage: 15, color: '#8b5cf6' }
  ],
  recentActivities: [
    { 
      type: 'order', 
      title: 'Đơn hàng mới #3847', 
      time: '2 phút trước', 
      value: '$320.50',
      icon: 'dollar'
    },
    { 
      type: 'customer', 
      title: 'Khách hàng mới đăng ký', 
      time: '15 phút trước', 
      value: 'Nguyễn Văn A',
      icon: 'user'
    },
    { 
      type: 'product', 
      title: 'Sản phẩm mới được thêm', 
      time: '1 giờ trước', 
      value: 'Áo khoác mùa đông',
      icon: 'box'
    },
    { 
      type: 'review', 
      title: 'Đánh giá mới 5 sao', 
      time: '2 giờ trước', 
      value: 'Áo thun đen',
      icon: 'star'
    },
    { 
      type: 'warning', 
      title: 'Sản phẩm sắp hết hàng', 
      time: '3 giờ trước', 
      value: 'Giày thể thao',
      icon: 'alert'
    }
  ],
  topProducts: [
    {
      rank: 1,
      name: 'Áo thun đen',
      sales: 2345,
      revenue: 187600,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100'
    },
    {
      rank: 2,
      name: 'Túi da xanh',
      sales: 1890,
      revenue: 257040,
      image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=100'
    },
    {
      rank: 3,
      name: 'Váy vàng',
      sales: 1654,
      revenue: 362226,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100'
    },
    {
      rank: 4,
      name: 'Tai nghe cam',
      sales: 1432,
      revenue: 330792,
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=100'
    },
    {
      rank: 5,
      name: 'Giày trẻ em',
      sales: 1289,
      revenue: 114721,
      image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=100'
    }
  ]
};

// Initialize Dashboard
function initDashboard() {
  animateStats();
  animateCharts();
  setupRealTimeUpdates();
  setupInteractions();
}

// Animate statistics cards
function animateStats() {
  const statCards = document.querySelectorAll('.stat-card');
  
  statCards.forEach((card, index) => {
    // Set initial state
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    
    // Animate in
    setTimeout(() => {
      card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 100);
    
    // Animate numbers
    const valueElement = card.querySelector('.stat-value');
    if (valueElement) {
      animateValue(valueElement, 0, parseFloat(valueElement.textContent.replace(/[^0-9.]/g, '')), 2000);
    }
  });
}

// Animate number counting
function animateValue(element, start, end, duration) {
  const startTime = performance.now();
  const prefix = element.textContent.includes('$') ? '$' : '';
  const hasComma = end > 1000;
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const current = Math.floor(start + (end - start) * easeOutQuart);
    
    element.textContent = prefix + (hasComma ? current.toLocaleString() : current);
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = prefix + (hasComma ? end.toLocaleString() : end);
    }
  }
  
  requestAnimationFrame(update);
}

// Animate charts
function animateCharts() {
  // Animate bar chart
  const bars = document.querySelectorAll('.bar');
  bars.forEach((bar, index) => {
    const targetHeight = bar.style.height;
    bar.style.height = '0%';
    
    setTimeout(() => {
      bar.style.transition = 'height 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
      bar.style.height = targetHeight;
    }, 500 + index * 80);
  });
  
  // Pulse animation for donut chart
  const donut = document.querySelector('.donut');
  if (donut) {
    let rotation = 0;
    setInterval(() => {
      rotation += 0.2;
      donut.style.transform = `rotate(${rotation}deg)`;
    }, 50);
  }
}

// Setup real-time updates
function setupRealTimeUpdates() {
  // Simulate real-time activity updates
  setInterval(() => {
    updateRecentActivity();
  }, 10000); // Update every 10 seconds
  
  // Update clock
  updateClock();
  setInterval(updateClock, 1000);
}

// Update recent activity
function updateRecentActivity() {
  const activityList = document.querySelector('.activity-list');
  if (!activityList) return;
  
  const firstItem = activityList.querySelector('.activity-item');
  if (firstItem) {
    // Add pulse animation
    firstItem.style.animation = 'pulse 1s ease';
    setTimeout(() => {
      firstItem.style.animation = '';
    }, 1000);
  }
}

// Update clock
function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('vi-VN');
  const dateString = now.toLocaleDateString('vi-VN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Update if clock element exists
  const clockElement = document.querySelector('.dashboard-clock');
  if (clockElement) {
    clockElement.innerHTML = `
      <div style="font-size: 14px; color: var(--muted);">${dateString}</div>
      <div style="font-size: 24px; font-weight: 800; color: var(--text);">${timeString}</div>
    `;
  }
}

// Setup interactions
function setupInteractions() {
  // Stat card hover effects
  const statCards = document.querySelectorAll('.stat-card');
  statCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-8px) scale(1.02)';
      this.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
      this.style.boxShadow = '';
    });
  });
  
  // Bar chart tooltips
  const bars = document.querySelectorAll('.bar');
  bars.forEach((bar, index) => {
    bar.addEventListener('mouseenter', function() {
      showTooltip(this, `Tháng ${index + 1}: $${Math.floor(Math.random() * 100000 + 50000).toLocaleString()}`);
    });
    
    bar.addEventListener('mouseleave', function() {
      hideTooltip();
    });
  });
  
  // Activity item clicks
  const activityItems = document.querySelectorAll('.activity-item');
  activityItems.forEach(item => {
    item.addEventListener('click', function() {
      this.style.backgroundColor = '#1f2d47';
      setTimeout(() => {
        this.style.backgroundColor = '';
      }, 200);
    });
  });
  
  // Product item clicks
  const productItems = document.querySelectorAll('.product-item');
  productItems.forEach(item => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', function() {
      showNotification('Đang chuyển đến trang sản phẩm...', 'info');
      setTimeout(() => {
        window.location.href = 'product-details.html';
      }, 500);
    });
  });
}

// Show tooltip
function showTooltip(element, text) {
  const tooltip = document.createElement('div');
  tooltip.className = 'chart-tooltip';
  tooltip.textContent = text;
  tooltip.style.cssText = `
    position: absolute;
    background: rgba(20, 28, 43, 0.95);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    pointer-events: none;
    z-index: 1000;
    white-space: nowrap;
    border: 1px solid var(--line);
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  `;
  
  document.body.appendChild(tooltip);
  
  const rect = element.getBoundingClientRect();
  tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
  tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
  
  element._tooltip = tooltip;
}

// Hide tooltip
function hideTooltip() {
  const tooltips = document.querySelectorAll('.chart-tooltip');
  tooltips.forEach(tooltip => tooltip.remove());
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  
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
  `;
  
  notification.innerHTML = `
    <span style="font-size: 20px;">${color.icon}</span>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideUp 0.3s ease reverse';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Export dashboard data (for future API integration)
function exportDashboardData(format = 'json') {
  const data = {
    exportDate: new Date().toISOString(),
    stats: DASHBOARD_DATA.stats,
    revenue: DASHBOARD_DATA.monthlyRevenue,
    categories: DASHBOARD_DATA.categoryDistribution,
    topProducts: DASHBOARD_DATA.topProducts
  };
  
  if (format === 'json') {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Dữ liệu đã được xuất thành công! 📊', 'success');
  }
}

// Refresh dashboard data
function refreshDashboard() {
  showNotification('Đang làm mới dữ liệu...', 'info');
  
  // Simulate API call
  setTimeout(() => {
    // Re-animate stats
    animateStats();
    showNotification('Dữ liệu đã được cập nhật! ✓', 'success');
  }, 1000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // Ctrl/Cmd + R: Refresh dashboard
  if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
    e.preventDefault();
    refreshDashboard();
  }
  
  // Ctrl/Cmd + E: Export data
  if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
    e.preventDefault();
    exportDashboardData();
  }
});

// Add pulse animation
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  @keyframes slideUp {
    from { transform: translateY(100px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  .stat-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}

// Log dashboard info
console.log('📊 Dashboard initialized');
console.log('💡 Keyboard shortcuts:');
console.log('  - Ctrl/Cmd + R: Refresh dashboard');
console.log('  - Ctrl/Cmd + E: Export data');


