// Khách hàng management functionality
document.addEventListener("DOMContentLoaded", () => {
  const customerSearch = document.getElementById("customerSearch");
  const customerTable = document.getElementById("customerTable");
  const filterTypeBtn = document.getElementById("filterTypeBtn");
  const filterTypeDropdown = document.getElementById("filterTypeDropdown");
  const filterSortBtn = document.getElementById("filterSortBtn");
  const filterSortDropdown = document.getElementById("filterSortDropdown");
  const btnExportList = document.getElementById("btnExportList");
  const btnAddCustomer = document.getElementById("btnAddCustomer");
  const addCustomerModal = document.getElementById("addCustomerModal");
  const btnSaveCustomer = document.getElementById("btnSaveCustomer");
  const customerModalClose = document.querySelectorAll(".customer-modal-close");

  if (!customerTable) return;

  // Lưu tất cả các dòng ban đầu (clone để giữ nguyên)
  let allRows = Array.from(customerTable.querySelectorAll("tr")).map(row => row.cloneNode(true));
  let currentFilter = "";
  let currentSort = "spending-desc";
  let currentSearch = "";
  
  // Lưu reference đến table ban đầu để có thể restore
  const originalTableHTML = customerTable.innerHTML;

  // ========== FILTER DROPDOWN FUNCTIONALITY ==========
  function setupFilterDropdown(btn, dropdown, options) {
    if (!btn || !dropdown) return;

    // Toggle dropdown
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = btn.classList.contains("open");
      
      // Đóng tất cả dropdowns khác
      document.querySelectorAll(".filter-btn.open").forEach(b => {
        if (b !== btn) b.classList.remove("open");
      });
      document.querySelectorAll(".filter-dropdown.open").forEach(d => {
        if (d !== dropdown) d.classList.remove("open");
      });

      // Toggle dropdown hiện tại
      if (isOpen) {
        btn.classList.remove("open");
        dropdown.classList.remove("open");
      } else {
        btn.classList.add("open");
        dropdown.classList.add("open");
      }
    });

    // Xử lý click vào option
    options.forEach(option => {
      option.addEventListener("click", (e) => {
        e.stopPropagation();
        const value = option.getAttribute("data-value");
        const text = option.textContent.trim();
        
        // Update button text
        btn.querySelector("span:first-child").textContent = text;
        
        // Update active state
        options.forEach(opt => opt.classList.remove("active"));
        option.classList.add("active");
        
        // Close dropdown
        btn.classList.remove("open");
        dropdown.classList.remove("open");

        // Apply filter/sort
        if (btn === filterTypeBtn) {
          currentFilter = value;
        } else if (btn === filterSortBtn) {
          currentSort = value;
        }
        
        applyFiltersAndSort();
      });
    });
  }

  // Setup filter dropdowns
  if (filterTypeBtn && filterTypeDropdown) {
    const typeOptions = filterTypeDropdown.querySelectorAll(".filter-option");
    setupFilterDropdown(filterTypeBtn, filterTypeDropdown, typeOptions);
  }

  if (filterSortBtn && filterSortDropdown) {
    const sortOptions = filterSortDropdown.querySelectorAll(".filter-option");
    setupFilterDropdown(filterSortBtn, filterSortDropdown, sortOptions);
  }

  // Đóng dropdown khi click bên ngoài
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".filter-btn") && !e.target.closest(".filter-dropdown")) {
      document.querySelectorAll(".filter-btn.open").forEach(btn => btn.classList.remove("open"));
      document.querySelectorAll(".filter-dropdown.open").forEach(dropdown => dropdown.classList.remove("open"));
    }
  });

  // ========== FILTER AND SORT FUNCTIONALITY ==========
  function applyFiltersAndSort() {
    // Restore from original rows
    let filteredRows = allRows.map(row => row.cloneNode(true));

    // Apply search filter first
    if (currentSearch) {
      const searchTerm = currentSearch.toLowerCase().trim();
      filteredRows = filteredRows.filter(row => {
        const name = row.querySelector(".product-name")?.textContent.toLowerCase() || "";
        const meta = row.querySelector(".product-meta")?.textContent.toLowerCase() || "";
        const allText = row.textContent.toLowerCase();
        return name.includes(searchTerm) || meta.includes(searchTerm) || allText.includes(searchTerm);
      });
    }

    // Apply type filter
    if (currentFilter) {
      filteredRows = filteredRows.filter(row => {
        const rowType = row.getAttribute("data-type");
        return rowType === currentFilter;
      });
    }

    // Apply sort
    filteredRows.sort((a, b) => {
      if (currentSort === "spending-desc") {
        const spendingA = parseInt(a.getAttribute("data-spending") || 0);
        const spendingB = parseInt(b.getAttribute("data-spending") || 0);
        return spendingB - spendingA;
      } else if (currentSort === "spending-asc") {
        const spendingA = parseInt(a.getAttribute("data-spending") || 0);
        const spendingB = parseInt(b.getAttribute("data-spending") || 0);
        return spendingA - spendingB;
      } else if (currentSort === "newest") {
        const dateA = new Date(a.getAttribute("data-date") || 0);
        const dateB = new Date(b.getAttribute("data-date") || 0);
        return dateB - dateA;
      } else if (currentSort === "oldest") {
        const dateA = new Date(a.getAttribute("data-date") || 0);
        const dateB = new Date(b.getAttribute("data-date") || 0);
        return dateA - dateB;
      }
      return 0;
    });

    // Clear table and re-append sorted rows
    customerTable.innerHTML = "";
    filteredRows.forEach(row => {
      row.style.display = ""; // Reset display
      customerTable.appendChild(row);
    });
  }
  
  // Function to refresh allRows when new customer is added
  function refreshAllRows() {
    allRows = Array.from(customerTable.querySelectorAll("tr")).map(row => row.cloneNode(true));
  }

  // ========== SEARCH FUNCTIONALITY ==========
  const customerSearchFilter = document.getElementById("customerSearchFilter");
  
  // Function to handle search
  function handleSearch(searchTerm) {
    currentSearch = searchTerm;
    applyFiltersAndSort();
  }

  // Search in topbar
  if (customerSearch) {
    customerSearch.addEventListener("input", (e) => {
      handleSearch(e.target.value);
    });
    
    // Clear search on escape
    customerSearch.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        customerSearch.value = "";
        handleSearch("");
      }
    });
  }

  // Search in filter group
  if (customerSearchFilter) {
    let isUpdating = false;
    
    customerSearchFilter.addEventListener("input", (e) => {
      if (!isUpdating && customerSearch) {
        isUpdating = true;
        customerSearch.value = e.target.value;
        isUpdating = false;
      }
      handleSearch(e.target.value);
    });
    
    // Clear search on escape
    customerSearchFilter.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        customerSearchFilter.value = "";
        if (customerSearch) customerSearch.value = "";
        handleSearch("");
      }
    });
  }
  
  // Sync search from topbar to filter group
  if (customerSearch && customerSearchFilter) {
    let isUpdating = false;
    customerSearch.addEventListener("input", (e) => {
      if (!isUpdating) {
        isUpdating = true;
        customerSearchFilter.value = e.target.value;
        isUpdating = false;
      }
      handleSearch(e.target.value);
    });
  }

  // ========== EXPORT LIST FUNCTIONALITY ==========
  if (btnExportList) {
    btnExportList.addEventListener("click", () => {
      const rows = Array.from(customerTable.querySelectorAll("tr:not([style*='display: none'])"));
      
      if (rows.length === 0) {
        alert("Không có dữ liệu để xuất!");
        return;
      }

      // Prepare CSV data
      let csvContent = "Họ và tên,Đơn gần nhất,Loại,Tổng chi tiêu\n";
      
      rows.forEach(row => {
        const name = row.querySelector(".product-name")?.textContent.trim() || "";
        const date = row.cells[1]?.textContent.trim() || "";
        const type = row.cells[2]?.textContent.trim() || "";
        const spending = row.getAttribute("data-spending") || "0";
        const spendingFormatted = parseInt(spending).toLocaleString("vi-VN") + "₫";
        
        csvContent += `"${name}","${date}","${type}","${spendingFormatted}"\n`;
      });

      // Create blob and download
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `danh_sach_khach_hang_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      const originalText = btnExportList.innerHTML;
      btnExportList.innerHTML = "✓ Đã xuất!";
      btnExportList.style.background = "var(--accent)";
      setTimeout(() => {
        btnExportList.innerHTML = originalText;
        btnExportList.style.background = "";
      }, 2000);
    });
  }

  // ========== ADD CUSTOMER MODAL FUNCTIONALITY ==========
  if (btnAddCustomer && addCustomerModal) {
    // Open modal
    btnAddCustomer.addEventListener("click", () => {
      addCustomerModal.style.display = "flex";
      document.body.style.overflow = "hidden";
    });

    // Close modal
    customerModalClose.forEach(btn => {
      btn.addEventListener("click", () => {
        addCustomerModal.style.display = "none";
        document.body.style.overflow = "";
        // Reset form
        document.getElementById("customerName").value = "";
        document.getElementById("customerEmail").value = "";
        document.getElementById("customerPhone").value = "";
        document.getElementById("customerAddress").value = "";
        document.getElementById("customerType").value = "thuong";
      });
    });

    // Close modal when clicking outside
    addCustomerModal.addEventListener("click", (e) => {
      if (e.target === addCustomerModal) {
        addCustomerModal.style.display = "none";
        document.body.style.overflow = "";
      }
    });
  }

  // ========== SAVE CUSTOMER FUNCTIONALITY ==========
  if (btnSaveCustomer) {
    btnSaveCustomer.addEventListener("click", () => {
      const name = document.getElementById("customerName").value.trim();
      const email = document.getElementById("customerEmail").value.trim();
      const phone = document.getElementById("customerPhone").value.trim();
      const address = document.getElementById("customerAddress").value.trim();
      const type = document.getElementById("customerType").value;

      // Validation
      if (!name) {
        alert("Vui lòng nhập họ và tên!");
        return;
      }

      if (!phone) {
        alert("Vui lòng nhập số điện thoại!");
        return;
      }

      // Generate initials for avatar
      const initials = name
        .split(" ")
        .map(word => word[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);

      // Get current date
      const today = new Date();
      const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
      const dateAttr = today.toISOString().split("T")[0];

      // Create new row
      const newRow = document.createElement("tr");
      newRow.setAttribute("data-type", type);
      newRow.setAttribute("data-spending", "0");
      newRow.setAttribute("data-date", dateAttr);
      newRow.setAttribute("data-email", email || "");
      newRow.setAttribute("data-phone", phone || "");
      newRow.setAttribute("data-address", address || "");
      newRow.setAttribute("data-join-date", dateAttr);
      newRow.setAttribute("data-orders", "0");
      newRow.setAttribute("data-rating", "5.0");

      // Determine status class and text
      let statusClass = "status pending";
      let statusText = "Thường";
      if (type === "vip") {
        statusClass = "status success";
        statusText = "VIP";
      } else if (type === "moi") {
        statusClass = "status";
        statusText = "Mới";
        newRow.setAttribute("style", "background: rgba(59, 130, 246, 0.16); color: #3b82f6;");
      }

      newRow.innerHTML = `
        <td>
          <div class="product-cell">
            <div class="avatar" style="width: 40px; height: 40px;">
              <span>${initials}</span>
            </div>
            <div class="product-info">
              <div class="product-name">${name}</div>
              <div class="product-meta">⭐ 5.0 • 0 đơn • 0₫</div>
            </div>
          </div>
        </td>
        <td>${dateStr}</td>
        <td><span class="${statusClass}">${statusText}</span></td>
        <td class="cell-right">
          <div class="action-menu">
            <button type="button" class="action-toggle">⋯</button>
            <div class="action-dropdown">
              <button class="action-item" data-action="view">👁 Xem chi tiết</button>
              <button class="action-item" data-action="message">💬 Gửi tin nhắn</button>
              <button class="action-item" data-action="email">✉️ Gửi email</button>
              <button class="action-item danger" data-action="block">🚫 Chặn khách hàng</button>
            </div>
          </div>
        </td>
      `;

      // Add to table (at the beginning)
      customerTable.insertBefore(newRow, customerTable.firstChild);
      
      // Update allRows
      refreshAllRows();
      
      // Update KPI cards
      updateKPICards();

      // Apply current filters
      applyFiltersAndSort();

      // Close modal
      addCustomerModal.style.display = "none";
      document.body.style.overflow = "";

      // Reset form
      document.getElementById("customerName").value = "";
      document.getElementById("customerEmail").value = "";
      document.getElementById("customerPhone").value = "";
      document.getElementById("customerAddress").value = "";
      document.getElementById("customerType").value = "thuong";

      // Show success message
      alert(`Đã thêm khách hàng "${name}" thành công!`);
    });
  }

  // ========== CUSTOMER DETAIL MODAL FUNCTIONALITY ==========
  const customerDetailModal = document.getElementById("customerDetailModal");
  const customerDetailClose = document.querySelectorAll(".customer-detail-close");
  const btnCustomerMessage = document.getElementById("btnCustomerMessage");
  const btnViewOrders = document.getElementById("btnViewOrders");

  // Function to format date
  function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  }

  // Function to calculate average spending
  function calculateAvgSpending(total, orders) {
    if (!orders || orders === 0) return "0₫";
    const avg = Math.round(total / orders);
    return avg.toLocaleString("vi-VN") + "₫";
  }

  // Function to get status text
  function getStatusText(type) {
    switch(type) {
      case "vip": return "VIP";
      case "thuong": return "Thường";
      case "moi": return "Mới";
      default: return "Thường";
    }
  }

  // Function to get status class
  function getStatusClass(type) {
    switch(type) {
      case "vip": return "status success";
      case "thuong": return "status pending";
      case "moi": return "status";
      default: return "status pending";
    }
  }

  // Function to open customer detail modal
  function openCustomerDetail(row) {
    const name = row.querySelector(".product-name")?.textContent.trim() || "";
    const initials = row.querySelector(".avatar span")?.textContent.trim() || "";
    const type = row.getAttribute("data-type") || "thuong";
    const email = row.getAttribute("data-email") || "";
    const phone = row.getAttribute("data-phone") || "";
    const address = row.getAttribute("data-address") || "";
    const joinDate = row.getAttribute("data-join-date") || "";
    const orders = row.getAttribute("data-orders") || "0";
    const rating = row.getAttribute("data-rating") || "0";
    const spending = parseInt(row.getAttribute("data-spending") || 0);

    // Populate modal
    document.getElementById("customerDetailName").textContent = name;
    document.getElementById("customerDetailAvatar").querySelector("span").textContent = initials;
    document.getElementById("customerDetailEmail").textContent = email;
    document.getElementById("customerDetailPhone").textContent = phone;
    document.getElementById("customerDetailAddress").textContent = address;
    document.getElementById("customerDetailOrders").textContent = orders;
    document.getElementById("customerDetailRating").textContent = rating;
    document.getElementById("customerDetailTotalSpending").textContent = spending.toLocaleString("vi-VN") + "₫";
    document.getElementById("customerDetailAvgSpending").textContent = calculateAvgSpending(spending, parseInt(orders));

    // Update type badge
    const typeElement = document.getElementById("customerDetailType");
    typeElement.textContent = getStatusText(type);
    typeElement.className = getStatusClass(type);

    // Update join date
    if (joinDate) {
      document.getElementById("customerJoinDate").textContent = `Thành viên từ ${formatDate(joinDate)}`;
    }

    // Show modal
    customerDetailModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  // Close modal
  if (customerDetailClose.length > 0) {
    customerDetailClose.forEach(btn => {
      btn.addEventListener("click", () => {
        customerDetailModal.style.display = "none";
        document.body.style.overflow = "";
      });
    });
  }

  // Close modal when clicking outside
  if (customerDetailModal) {
    customerDetailModal.addEventListener("click", (e) => {
      if (e.target === customerDetailModal) {
        customerDetailModal.style.display = "none";
        document.body.style.overflow = "";
      }
    });
  }

  // Handle view action from action menu
  document.addEventListener("click", (e) => {
    const actionItem = e.target.closest(".action-item[data-action='view']");
    if (actionItem) {
      const row = actionItem.closest("tr");
      if (row) {
        openCustomerDetail(row);
      }
    }
  });

  // Handle message button
  if (btnCustomerMessage) {
    btnCustomerMessage.addEventListener("click", () => {
      const phone = document.getElementById("customerDetailPhone").textContent;
      alert(`Mở ứng dụng nhắn tin cho số: ${phone}`);
    });
  }

  // Handle view orders button
  if (btnViewOrders) {
    btnViewOrders.addEventListener("click", () => {
      const name = document.getElementById("customerDetailName").textContent;
      const phone = document.getElementById("customerDetailPhone").textContent;
      
      // Chuyển đến trang đơn hàng với filter theo khách hàng
      const params = new URLSearchParams();
      params.set("customer", name);
      if (phone) {
        params.set("phone", phone);
      }
      window.location.href = `donhang-full.html?${params.toString()}`;
    });
  }

  // ========== UPDATE KPI CARDS ==========
  function updateKPICards() {
    // Đếm tổng số khách hàng
    const totalCustomers = allRows.length;
    
    // Đếm số khách VIP
    const vipCustomers = allRows.filter(row => row.getAttribute("data-type") === "vip").length;
    
    // Đếm số khách mới trong 30 ngày
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newCustomers = allRows.filter(row => {
      const joinDate = row.getAttribute("data-join-date");
      if (!joinDate) return false;
      const joinDateObj = new Date(joinDate);
      return joinDateObj >= thirtyDaysAgo;
    }).length;
    
    // Tính tỷ lệ quay lại (khách có đơn hàng > 0)
    const returningCustomers = allRows.filter(row => {
      const orders = parseInt(row.getAttribute("data-orders") || "0");
      return orders > 0;
    }).length;
    const returnRate = totalCustomers > 0 ? Math.round((returningCustomers / totalCustomers) * 100) : 0;
    
    // Cập nhật KPI cards
    const kpiTotal = document.querySelector(".kpi-card:nth-child(1) .kpi-value");
    const kpiVIP = document.querySelector(".kpi-card:nth-child(2) .kpi-value");
    const kpiNew = document.querySelector(".kpi-card:nth-child(3) .kpi-value");
    const kpiReturn = document.querySelector(".kpi-card:nth-child(4) .kpi-value");
    
    if (kpiTotal) {
      kpiTotal.textContent = totalCustomers.toLocaleString("vi-VN");
    }
    
    if (kpiVIP) {
      kpiVIP.textContent = vipCustomers.toLocaleString("vi-VN");
      const vipPercent = totalCustomers > 0 ? ((vipCustomers / totalCustomers) * 100).toFixed(1) : 0;
      const vipFooter = document.querySelector(".kpi-card:nth-child(2) .kpi-footer");
      if (vipFooter) {
        vipFooter.textContent = `${vipPercent}% tổng số`;
      }
    }
    
    if (kpiNew) {
      kpiNew.textContent = newCustomers.toLocaleString("vi-VN");
    }
    
    if (kpiReturn) {
      kpiReturn.textContent = `${returnRate}%`;
    }
  }

  // Initialize: apply default sort and update KPI
  applyFiltersAndSort();
  updateKPICards();
});



