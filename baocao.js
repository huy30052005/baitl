// Báo cáo & Biểu đồ - SellerHub
let chartsInitialized = false;

document.addEventListener("DOMContentLoaded", () => {
  // Kiểm tra xem có Chart.js không
  if (typeof Chart === 'undefined') {
    console.error('Chart.js chưa được tải!');
    return;
  }

  // Tránh gọi nhiều lần
  if (chartsInitialized) return;
  
  // Đợi một chút để đảm bảo các script khác đã load xong
  setTimeout(() => {
    if (!chartsInitialized) {
      initializeCharts();
    }
  }, 200);

  // Thiết lập nút xuất báo cáo
  const exportReportBtn = document.getElementById("exportReportBtn");
  if (exportReportBtn) {
    exportReportBtn.addEventListener("click", exportReport);
  }
});

function initializeCharts() {
  if (chartsInitialized) return;
  chartsInitialized = true;

  try {
    // Lấy dữ liệu từ localStorage hoặc global variable
    let orders = [];
    if (typeof window !== 'undefined' && window.ordersSeed && Array.isArray(window.ordersSeed)) {
      orders = window.ordersSeed;
    } else {
      const stored = localStorage.getItem("orders");
      if (stored) {
        orders = JSON.parse(stored);
      }
    }
    
    // Nếu không có dữ liệu, tạo dữ liệu mẫu (ít hơn)
    if (!orders || orders.length === 0) {
      generateSampleData();
      const stored = localStorage.getItem("orders");
      if (stored) {
        orders = JSON.parse(stored);
      }
    }

    // Giới hạn số lượng đơn hàng để xử lý nhanh hơn
    if (orders.length > 500) {
      orders = orders.slice(0, 500);
    }

    // Vẽ các biểu đồ
    renderRevenueChart(orders);
    renderCategoryChart(orders);
    renderOrdersByHourChart(orders);
    updateKPIs(orders);
    
    // Xử lý tab switching
    setupTabSwitching();
  } catch (error) {
    console.error('Lỗi khi khởi tạo biểu đồ:', error);
    chartsInitialized = false;
  }
}

// ========== HELPER: LẤY DỮ LIỆU ĐƠN HÀNG ==========
function getOrdersData() {
  if (typeof window !== 'undefined' && window.ordersSeed && Array.isArray(window.ordersSeed)) {
    return window.ordersSeed;
  }
  return JSON.parse(localStorage.getItem("orders") || "[]");
}

// ========== TẠO DỮ LIỆU MẪU NẾU CHƯA CÓ ==========
function generateSampleData() {
  // Kiểm tra xem đã có dữ liệu chưa
  const existing = localStorage.getItem("orders");
  if (existing) {
    try {
      const parsed = JSON.parse(existing);
      if (parsed && parsed.length > 0) {
        return; // Đã có dữ liệu rồi
      }
    } catch (e) {
      // Lỗi parse, tiếp tục tạo mới
    }
  }

  const sampleOrders = [];
  const now = new Date();
  
  // Giảm số lượng: chỉ tạo 30-50 đơn hàng thay vì 90-150
  const totalOrders = 40;
  
  for (let i = 0; i < totalOrders; i++) {
    // Phân bố đều trong 6 tháng gần nhất
    const monthOffset = Math.floor(i / (totalOrders / 6));
    const monthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    
    const day = Math.floor(Math.random() * daysInMonth) + 1;
    const hour = Math.floor(Math.random() * 24);
    const orderDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day, hour);
    
    const orderValue = Math.floor(Math.random() * 5000000) + 500000; // 500k - 5.5M
    
    const productNames = ['iPhone 15 Pro Max', 'MacBook Air M3', 'AirPods Pro 2', 'iPad Pro', 'Apple Watch'];
    const categories = ['Điện thoại', 'Laptop', 'Phụ kiện', 'Máy tính bảng', 'Đồng hồ'];
    const emojis = ['📱', '💻', '🎧', '⌚', '🖥️'];
    const productIndex = Math.floor(Math.random() * 5);
    
    sampleOrders.push({
      code: `#DH-${10000 + i}`,
      total: orderValue,
      status: ['completed', 'completed', 'completed', 'processing', 'shipping'][Math.floor(Math.random() * 5)],
      createdAt: orderDate.toISOString(),
      products: [{
        name: productNames[productIndex],
        category: categories[productIndex],
        emoji: emojis[productIndex],
        quantity: Math.floor(Math.random() * 3) + 1,
        price: orderValue
      }]
    });
  }
  
  try {
    localStorage.setItem("orders", JSON.stringify(sampleOrders));
  } catch (e) {
    console.error('Lỗi khi lưu dữ liệu mẫu:', e);
  }
}

// ========== VẼ BIỂU ĐỒ DOANH THU ==========
function renderRevenueChart(ordersParam = null) {
  const ctx = document.getElementById('revenueChart');
  if (!ctx) return;

  let orders = ordersParam || getOrdersData();
  if (!orders || orders.length === 0) return;
  
  // Tính doanh thu theo tháng (6 tháng gần nhất)
  const revenueByMonth = {};
  const ordersByMonth = {};
  const profitByMonth = {};
  
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
    revenueByMonth[monthKey] = 0;
    ordersByMonth[monthKey] = 0;
    profitByMonth[monthKey] = 0;
  }

  orders.forEach(order => {
    if (order.status === 'completed' && order.total) {
      const orderDate = new Date(order.createdAt);
      const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (revenueByMonth.hasOwnProperty(monthKey)) {
        revenueByMonth[monthKey] += parseFloat(order.total) || 0;
        ordersByMonth[monthKey] += 1;
        profitByMonth[monthKey] += (parseFloat(order.total) || 0) * 0.3; // Giả sử lợi nhuận 30%
      }
    }
  });

  // Sắp xếp theo thứ tự thời gian
  const sortedMonths = Object.keys(revenueByMonth).sort();
  const labels = sortedMonths.map(month => {
    const [year, monthNum] = month.split('-');
    const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    return `${monthNames[parseInt(monthNum) - 1]}/${year.slice(2)}`;
  }).reverse();

  const revenueData = sortedMonths.map(month => revenueByMonth[month]).reverse();
  const ordersData = sortedMonths.map(month => ordersByMonth[month]).reverse();
  const profitData = sortedMonths.map(month => profitByMonth[month]).reverse();

  let currentChart = null;

  function createChart(type, data, label, color) {
    if (currentChart) {
      currentChart.destroy();
    }

    currentChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: label,
          data: data,
          borderColor: color,
          backgroundColor: color + '20',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#9ca3af',
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#1f2933',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                if (type === 'revenue' || type === 'profit') {
                  return formatCurrency(context.parsed.y);
                }
                return context.parsed.y + ' đơn';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#1f2933'
            },
            ticks: {
              color: '#9ca3af',
              callback: function(value) {
                if (type === 'revenue' || type === 'profit') {
                  if (value >= 1000000) {
                    return (value / 1000000).toFixed(1) + 'M₫';
                  }
                  return (value / 1000).toFixed(0) + 'K₫';
                }
                return value;
              }
            }
          },
          x: {
            grid: {
              color: '#1f2933'
            },
            ticks: {
              color: '#9ca3af'
            }
          }
        }
      }
    });
  }

  // Vẽ biểu đồ doanh thu mặc định
  createChart('revenue', revenueData, 'Doanh thu', '#22c55e');

  // Xử lý tab switching - lưu biến để dùng trong closure
  const tabButtons = document.querySelectorAll('.tab-btn');
  if (tabButtons.length > 0) {
    // Xóa event listener cũ bằng cách thay thế
    tabButtons.forEach((btn, index) => {
      // Kiểm tra xem đã có data attribute chưa
      if (btn.dataset.listenerAttached === 'true') {
        return; // Đã gắn rồi
      }
      btn.dataset.listenerAttached = 'true';
      
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Xóa active từ tất cả
        tabButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        if (index === 0) {
          createChart('revenue', revenueData, 'Doanh thu', '#22c55e');
        } else if (index === 1) {
          createChart('profit', profitData, 'Lợi nhuận', '#3b82f6');
        } else if (index === 2) {
          createChart('orders', ordersData, 'Số đơn hàng', '#f59e0b');
        }
      });
    });
  }
}

// ========== VẼ BIỂU ĐỒ DOANH THU THEO DANH MỤC ==========
function renderCategoryChart(ordersParam = null) {
  const ctx = document.getElementById('categoryChart');
  if (!ctx) {
    console.error('Không tìm thấy canvas categoryChart');
    return;
  }

  let orders = ordersParam || getOrdersData();
  if (!orders) orders = [];
  
  // Tính doanh thu theo danh mục
  const revenueByCategory = {};
  
  orders.forEach(order => {
    if (order.status === 'completed' && (order.products || order.items)) {
      const items = order.products || order.items || [];
      items.forEach(item => {
        const category = item.category || 'Khác';
        if (!revenueByCategory[category]) {
          revenueByCategory[category] = 0;
        }
        revenueByCategory[category] += parseFloat(item.price || order.total || 0);
      });
    }
  });

  // Nếu không có dữ liệu, dùng dữ liệu mẫu
  let sortedCategories = Object.entries(revenueByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (sortedCategories.length === 0) {
    // Dữ liệu mẫu
    sortedCategories = [
      ['Điện thoại', 45000000],
      ['Laptop', 25000000],
      ['Phụ kiện', 15000000],
      ['Máy tính bảng', 10000000],
      ['Đồng hồ', 5000000]
    ];
  }

  const labels = sortedCategories.map(([cat]) => cat);
  const data = sortedCategories.map(([, revenue]) => revenue);
  const total = data.reduce((sum, val) => sum + val, 0);
  const percentages = data.map(val => total > 0 ? ((val / total) * 100).toFixed(1) : '0.0');

  // Màu sắc cho biểu đồ
  const colors = [
    '#22c55e', // Xanh lá
    '#3b82f6', // Xanh dương
    '#f59e0b', // Vàng
    '#ef4444', // Đỏ
    '#8b5cf6'  // Tím
  ];

  try {
    // Xóa biểu đồ cũ nếu có
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
      existingChart.destroy();
    }

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: '#05070a',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 1,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#1f2933',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = formatCurrency(context.parsed);
                const percentage = percentages[context.dataIndex];
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    // Cập nhật danh sách phần trăm - tìm đúng phần tử
    const cardBody = ctx.closest('.card-body');
    if (cardBody) {
      // Tìm div chứa danh sách phần trăm
      let categoryList = cardBody.querySelector('div[style*="flex-direction: column"]');
      if (!categoryList) {
        // Tạo mới nếu chưa có
        categoryList = document.createElement('div');
        categoryList.style.cssText = 'display: flex; flex-direction: column; gap: 8px; margin-top: 16px;';
        cardBody.appendChild(categoryList);
      }
      
      categoryList.innerHTML = sortedCategories.map(([cat, revenue], index) => `
        <div style="display: flex; justify-content: space-between;">
          <span>${cat}</span>
          <span style="font-weight: 600;">${percentages[index]}%</span>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Lỗi khi vẽ biểu đồ danh mục:', error);
    // Hiển thị thông báo lỗi
    ctx.parentElement.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">Không thể tải biểu đồ</div>';
  }
}

// ========== VẼ BIỂU ĐỒ ĐƠN HÀNG THEO GIỜ ==========
function renderOrdersByHourChart(ordersParam = null) {
  const ctx = document.getElementById('ordersByHourChart');
  if (!ctx) return;

  let orders = ordersParam || getOrdersData();
  if (!orders || orders.length === 0) return;
  
  // Tính số đơn hàng theo giờ (0-23)
  const ordersByHour = Array(24).fill(0);
  
  orders.forEach(order => {
    if (order.createdAt) {
      const orderDate = new Date(order.createdAt);
      const hour = orderDate.getHours();
      ordersByHour[hour]++;
    }
  });

  const labels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Số đơn hàng',
        data: ordersByHour,
        backgroundColor: '#22c55e',
        borderColor: '#16a34a',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#1f2933',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              return context.parsed.y + ' đơn hàng';
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: '#1f2933'
          },
          ticks: {
            color: '#9ca3af',
            stepSize: 1
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#9ca3af',
            maxRotation: 45,
            minRotation: 45
          }
        }
      }
    }
  });
}

// ========== CẬP NHẬT KPI ==========
function updateKPIs(ordersParam = null) {
  let orders = ordersParam || getOrdersData();
  if (!orders) orders = [];
  
  let products = [];
  try {
    const stored = localStorage.getItem("products");
    if (stored) {
      products = JSON.parse(stored);
    }
  } catch (e) {
    console.error('Lỗi khi đọc products:', e);
  }
  
  // Tính tổng doanh thu
  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
  
  // Tổng đơn hàng
  const totalOrders = orders.length;
  
  // Giá trị đơn trung bình
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Lượt xem (giả sử)
  const views = Math.floor(totalOrders * 37); // Ước tính
  
  // Cập nhật KPI cards
  const kpiValues = document.querySelectorAll('.kpi-value');
  if (kpiValues.length >= 4) {
    kpiValues[0].textContent = formatCurrency(totalRevenue);
    kpiValues[1].textContent = totalOrders.toLocaleString('vi-VN');
    kpiValues[2].textContent = formatCurrency(avgOrderValue);
    kpiValues[3].textContent = views.toLocaleString('vi-VN');
  }
}

// ========== SETUP TAB SWITCHING ==========
function setupTabSwitching() {
  // Đã được xử lý trong renderRevenueChart
}

// ========== HELPER FUNCTIONS ==========
function formatCurrency(amount) {
  if (!amount) return '0₫';
  return Number(amount).toLocaleString('vi-VN') + '₫';
}

