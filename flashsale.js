// Flash Sale functionality
document.addEventListener("DOMContentLoaded", () => {
  const flashSaleModal = document.getElementById("flashSaleModal");
  const flashSaleForm = document.getElementById("flashSaleForm");
  const btnCreateFlashSale = document.getElementById("btnCreateFlashSale");
  const btnCreateFlashSaleEmpty = document.getElementById("btnCreateFlashSaleEmpty");
  const closeFlashSaleModal = document.getElementById("closeFlashSaleModal");
  const cancelFlashSaleBtn = document.getElementById("cancelFlashSaleBtn");
  const productSearchInput = document.getElementById("productSearchInput");
  const productDropdown = document.getElementById("productDropdown");
  const selectedProductsContainer = document.getElementById("selectedProductsContainer");
  const flashSaleListContainer = document.getElementById("flashSaleListContainer");
  const flashSaleEmptyState = document.getElementById("flashSaleEmptyState");
  const FLASH_SALE_STORAGE_KEY = "flash_sales";
  const PRODUCTS_STORAGE_KEY = "products";
  
  let selectedProducts = []; // Array of product IDs
  let allAvailableProducts = [];

  // ========== MỞ/ĐÓNG MODAL ==========
  function openFlashSaleModal() {
    if (!flashSaleModal) {
      console.error("Flash Sale modal not found!");
      return;
    }
    flashSaleModal.style.display = "flex";
    if (flashSaleForm) {
      flashSaleForm.reset();
    }
    selectedProducts = [];
    updateSelectedProductsDisplay();
    loadAvailableProducts();
  }

  [btnCreateFlashSale, btnCreateFlashSaleEmpty].forEach(btn => {
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openFlashSaleModal();
      });
    }
  });

  [closeFlashSaleModal, cancelFlashSaleBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener("click", () => {
        if (flashSaleModal) flashSaleModal.style.display = "none";
        if (flashSaleForm) flashSaleForm.reset();
        selectedProducts = [];
        updateSelectedProductsDisplay();
        if (productDropdown) productDropdown.style.display = "none";
        if (productSearchInput) productSearchInput.value = "";
      });
    }
  });

  if (flashSaleModal) {
    flashSaleModal.addEventListener("click", (e) => {
      if (e.target === flashSaleModal) {
        flashSaleModal.style.display = "none";
        if (flashSaleForm) flashSaleForm.reset();
        selectedProducts = [];
        updateSelectedProductsDisplay();
        if (productDropdown) productDropdown.style.display = "none";
        if (productSearchInput) productSearchInput.value = "";
      }
    });
  }

  // ========== LOAD SẢN PHẨM TỪ LOCALSTORAGE ==========
  function loadAvailableProducts() {
    try {
      allAvailableProducts = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY) || "[]");
      renderProductDropdown(allAvailableProducts);
    } catch (e) {
      console.error("Error loading products:", e);
      allAvailableProducts = [];
    }
  }

  // ========== RENDER PRODUCT DROPDOWN ==========
  function renderProductDropdown(products, searchTerm = "") {
    if (!productDropdown) return;

    // Filter products
    let filteredProducts = products;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredProducts = products.filter(p => 
        p.name?.toLowerCase().includes(term) || 
        p.sku?.toLowerCase().includes(term)
      );
    }

    // Remove already selected products
    filteredProducts = filteredProducts.filter(p => !selectedProducts.includes(p.id));

    if (filteredProducts.length === 0) {
      productDropdown.innerHTML = '<div style="padding: 12px; text-align: center; color: var(--text-muted);">Không tìm thấy sản phẩm</div>';
      productDropdown.style.display = "block";
      return;
    }

    productDropdown.innerHTML = filteredProducts.map(product => {
      const productName = product.name || "Không có tên";
      const productPrice = product.price ? formatCurrency(product.price) : "0₫";
      const productImage = product.image || "https://via.placeholder.com/40";
      
      return `
        <div class="product-dropdown-item" data-product-id="${product.id}" style="padding: 12px; cursor: pointer; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; transition: background 0.15s;">
          <img src="${productImage}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/40'" />
          <div style="flex: 1;">
            <div style="font-weight: 600; margin-bottom: 4px;">${productName}</div>
            <div style="font-size: 12px; color: var(--text-muted);">${productPrice}</div>
          </div>
        </div>
      `;
    }).join("");

    // Add click listeners
    productDropdown.querySelectorAll(".product-dropdown-item").forEach(item => {
      item.addEventListener("click", () => {
        const productId = item.getAttribute("data-product-id");
        addProductToSelection(productId);
      });
      item.addEventListener("mouseenter", () => {
        item.style.background = "var(--bg)";
      });
      item.addEventListener("mouseleave", () => {
        item.style.background = "transparent";
      });
    });

    productDropdown.style.display = "block";
  }

  // ========== TÌM KIẾM SẢN PHẨM ==========
  if (productSearchInput) {
    productSearchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.trim();
      renderProductDropdown(allAvailableProducts, searchTerm);
    });

    productSearchInput.addEventListener("focus", () => {
      if (allAvailableProducts.length > 0) {
        renderProductDropdown(allAvailableProducts, productSearchInput.value.trim());
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (productDropdown && productSearchInput) {
        if (!productDropdown.contains(e.target) && !productSearchInput.contains(e.target)) {
          productDropdown.style.display = "none";
        }
      }
    });
  }

  // ========== THÊM SẢN PHẨM VÀO DANH SÁCH CHỌN ==========
  function addProductToSelection(productId) {
    if (selectedProducts.includes(productId)) {
      return; // Already selected
    }

    const product = allAvailableProducts.find(p => p.id === productId);
    if (!product) {
      return;
    }

    selectedProducts.push(productId);
    updateSelectedProductsDisplay();
    
    // Clear search and hide dropdown
    if (productSearchInput) productSearchInput.value = "";
    if (productDropdown) productDropdown.style.display = "none";
  }

  // ========== XÓA SẢN PHẨM KHỎI DANH SÁCH CHỌN ==========
  function removeProductFromSelection(productId) {
    selectedProducts = selectedProducts.filter(id => id !== productId);
    updateSelectedProductsDisplay();
  }

  // ========== CẬP NHẬT HIỂN THỊ SẢN PHẨM ĐÃ CHỌN ==========
  function updateSelectedProductsDisplay() {
    if (!selectedProductsContainer) return;

    if (selectedProducts.length === 0) {
      selectedProductsContainer.innerHTML = '<div style="color: var(--text-muted); font-size: 13px; padding: 8px;">Chưa chọn sản phẩm nào</div>';
      return;
    }

    selectedProductsContainer.innerHTML = selectedProducts.map(productId => {
      const product = allAvailableProducts.find(p => p.id === productId);
      if (!product) return "";

      const productName = product.name || "Không có tên";
      const productImage = product.image || "https://via.placeholder.com/40";

      return `
        <div class="selected-product-tag" data-product-id="${productId}" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px;">
          <img src="${productImage}" style="width: 32px; height: 32px; border-radius: 6px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/32'" />
          <span style="font-size: 13px; font-weight: 500;">${productName}</span>
          <button type="button" class="remove-product-btn" data-product-id="${productId}" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 18px; padding: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: all 0.15s;">×</button>
        </div>
      `;
    }).join("");

    // Add remove button listeners
    selectedProductsContainer.querySelectorAll(".remove-product-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const productId = btn.getAttribute("data-product-id");
        removeProductFromSelection(productId);
      });
      btn.addEventListener("mouseenter", () => {
        btn.style.background = "var(--bg-elevated)";
        btn.style.color = "var(--danger)";
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.background = "transparent";
        btn.style.color = "var(--text-muted)";
      });
    });
  }

  // ========== HELPER FUNCTIONS ==========
  function formatCurrency(amount) {
    if (!amount) return "0₫";
    return amount.toLocaleString('vi-VN') + '₫';
  }

  // ========== XỬ LÝ FORM ==========
  if (flashSaleForm) {
    flashSaleForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = new FormData(flashSaleForm);
      const flashSaleName = formData.get("flashSaleName").trim();
      const startDate = formData.get("startDate");
      const startTime = formData.get("startTime");
      const endDate = formData.get("endDate");
      const endTime = formData.get("endTime");

      // Validation
      if (!flashSaleName) {
        alert("Vui lòng nhập tên chương trình!");
        return;
      }

      if (!startDate || !startTime || !endDate || !endTime) {
        alert("Vui lòng chọn đầy đủ ngày và giờ bắt đầu, kết thúc!");
        return;
      }

      // Combine date and time
      const startDateTime = `${startDate}T${startTime}`;
      const endDateTime = `${endDate}T${endTime}`;

      if (new Date(startDateTime) >= new Date(endDateTime)) {
        alert("Thời gian kết thúc phải sau thời gian bắt đầu!");
        return;
      }

      if (selectedProducts.length === 0) {
        alert("Vui lòng chọn ít nhất một sản phẩm!");
        return;
      }

      const editingId = flashSaleForm.dataset.editingId;
      
      if (editingId) {
        // EDIT MODE
        const flashSales = JSON.parse(localStorage.getItem(FLASH_SALE_STORAGE_KEY) || "[]");
        const flashSaleIndex = flashSales.findIndex(fs => fs.id === editingId);
        if (flashSaleIndex !== -1) {
          flashSales[flashSaleIndex] = {
            ...flashSales[flashSaleIndex],
            name: flashSaleName,
            startTime: startDateTime,
            endTime: endDateTime,
            products: selectedProducts.map(productId => {
              const product = allAvailableProducts.find(p => p.id === productId);
              const existingProduct = flashSales[flashSaleIndex].products.find(p => p.id === productId);
              return {
                id: productId,
                name: product?.name || "Không có tên",
                price: existingProduct?.price || product?.price || 0,
                originalPrice: existingProduct?.originalPrice || product?.price || 0,
                discount: existingProduct?.discount || 0,
                quantity: existingProduct?.quantity || 0,
                sold: existingProduct?.sold || 0
              };
            }),
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem(FLASH_SALE_STORAGE_KEY, JSON.stringify(flashSales));
          flashSaleForm.dataset.editingId = "";
        }
        alert(`Đã cập nhật Flash Sale "${flashSaleName}" thành công!`);
      } else {
        // CREATE MODE
        // Create Flash Sale object
        const flashSale = {
          id: "flashsale_" + Date.now(),
          name: flashSaleName,
          startTime: startDateTime,
          endTime: endDateTime,
          products: selectedProducts.map(productId => {
            const product = allAvailableProducts.find(p => p.id === productId);
            return {
              id: productId,
              name: product?.name || "Không có tên",
              price: product?.price || 0,
              originalPrice: product?.price || 0,
              discount: 0, // Can be set later
              quantity: 0, // Can be set later
              sold: 0
            };
          }),
          status: "pending", // pending, active, ended
          revenue: 0,
          createdAt: new Date().toISOString()
        };

        // Save to localStorage
        try {
          const flashSales = JSON.parse(localStorage.getItem(FLASH_SALE_STORAGE_KEY) || "[]");
          flashSales.push(flashSale);
          localStorage.setItem(FLASH_SALE_STORAGE_KEY, JSON.stringify(flashSales));
        } catch (e) {
          console.error("Error saving flash sale:", e);
          alert("Có lỗi xảy ra khi lưu Flash Sale!");
          return;
        }

        alert(`Đã tạo Flash Sale "${flashSaleName}" thành công với ${selectedProducts.length} sản phẩm!`);
      }

      // Close modal and reset
      if (flashSaleModal) flashSaleModal.style.display = "none";
      if (flashSaleForm) flashSaleForm.reset();
      flashSaleForm.dataset.editingId = "";
      selectedProducts = [];
      updateSelectedProductsDisplay();
      if (productDropdown) productDropdown.style.display = "none";
      if (productSearchInput) productSearchInput.value = "";

      // Cập nhật UI thay vì reload
      loadFlashSales();
      updateFlashSaleKPIs();
    });
  }

  // ========== XỬ LÝ ACTION MENU ==========
  // Xử lý action items cho Flash Sale
  // action-menu.js sẽ tự động xử lý việc mở/đóng menu khi click vào toggle
  document.addEventListener("click", (e) => {
    // Kiểm tra xem có phải click vào action item của Flash Sale không
    const item = e.target.closest(".action-item[data-flashsale-id]");
    if (!item) return;

    const action = item.getAttribute("data-action");
    const flashSaleId = item.getAttribute("data-flashsale-id");

    if (!action || !flashSaleId) return;

    // Ngăn event bubble
    e.stopPropagation();
    e.preventDefault();

    // Đóng menu (action-menu.js cũng sẽ làm điều này, nhưng đảm bảo chắc chắn)
    const menu = item.closest(".action-menu");
    if (menu) {
      menu.classList.remove("open");
    }

    // Xử lý action
    switch (action) {
      case "edit":
        editFlashSale(flashSaleId);
        break;
      case "duplicate":
        duplicateFlashSale(flashSaleId);
        break;
      case "delete":
        deleteFlashSale(flashSaleId);
        break;
    }
  });

  function editFlashSale(flashSaleId) {
    const flashSales = JSON.parse(localStorage.getItem(FLASH_SALE_STORAGE_KEY) || "[]");
    const flashSale = flashSales.find(fs => fs.id === flashSaleId);

    if (!flashSale) {
      alert("Không tìm thấy Flash Sale!");
      return;
    }

    // Parse datetime
    const startDateTime = new Date(flashSale.startTime);
    const endDateTime = new Date(flashSale.endTime);
    
    const startDate = startDateTime.toISOString().split('T')[0];
    const startTime = startDateTime.toTimeString().split(' ')[0].substring(0, 5);
    const endDate = endDateTime.toISOString().split('T')[0];
    const endTime = endDateTime.toTimeString().split(' ')[0].substring(0, 5);

    // Fill form
    document.getElementById("flashSaleName").value = flashSale.name;
    document.getElementById("flashSaleStartDate").value = startDate;
    document.getElementById("flashSaleStartTime").value = startTime;
    document.getElementById("flashSaleEndDate").value = endDate;
    document.getElementById("flashSaleEndTime").value = endTime;

    // Load selected products
    selectedProducts = flashSale.products.map(p => p.id);
    updateSelectedProductsDisplay();

    // Set editing mode
    flashSaleForm.dataset.editingId = flashSaleId;

    const modalTitle = flashSaleModal.querySelector("h2");
    const submitBtn = flashSaleForm.querySelector('button[type="submit"]');
    if (modalTitle) modalTitle.textContent = "Chỉnh sửa Flash Sale";
    if (submitBtn) submitBtn.textContent = "Cập nhật Flash Sale";

    openFlashSaleModal();
  }

  function duplicateFlashSale(flashSaleId) {
    const flashSales = JSON.parse(localStorage.getItem(FLASH_SALE_STORAGE_KEY) || "[]");
    const flashSale = flashSales.find(fs => fs.id === flashSaleId);

    if (!flashSale) {
      alert("Không tìm thấy Flash Sale để nhân bản!");
      return;
    }

    const newFlashSale = {
      ...flashSale,
      id: "flashsale_" + Date.now(),
      name: flashSale.name + " (Bản sao)",
      products: flashSale.products.map(p => ({ ...p, sold: 0 })),
      revenue: 0,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    flashSales.push(newFlashSale);
    localStorage.setItem(FLASH_SALE_STORAGE_KEY, JSON.stringify(flashSales));

    loadFlashSales();
    updateFlashSaleKPIs();
    alert(`Đã nhân bản Flash Sale "${flashSale.name}" thành công!`);
  }

  function deleteFlashSale(flashSaleId) {
    if (!confirm("Bạn có chắc chắn muốn xóa Flash Sale này?\n\nHành động này không thể hoàn tác!")) {
      return;
    }

    const flashSales = JSON.parse(localStorage.getItem(FLASH_SALE_STORAGE_KEY) || "[]");
    const filtered = flashSales.filter(fs => fs.id !== flashSaleId);
    localStorage.setItem(FLASH_SALE_STORAGE_KEY, JSON.stringify(filtered));

    loadFlashSales();
    updateFlashSaleKPIs();
    alert("Đã xóa Flash Sale thành công!");
  }

  // ========== LOAD VÀ HIỂN THỊ FLASH SALE ==========
  function loadFlashSales() {
    try {
      if (!flashSaleListContainer) {
        console.error("flashSaleListContainer not found!");
        return;
      }

      const flashSales = JSON.parse(localStorage.getItem(FLASH_SALE_STORAGE_KEY) || "[]");
      console.log("Loading flash sales:", flashSales.length);

      if (flashSales.length === 0) {
        flashSaleListContainer.innerHTML = "";
        if (flashSaleEmptyState) flashSaleEmptyState.style.display = "block";
        return;
      }

      if (flashSaleEmptyState) flashSaleEmptyState.style.display = "none";

      // Render flash sales
      const html = flashSales.map(flashSale => {
        return renderFlashSaleCard(flashSale);
      }).join("");

      flashSaleListContainer.innerHTML = html;

      // Re-attach toggle listeners
      attachFlashSaleToggleListeners();
      
      console.log("Flash sales loaded successfully");
    } catch (e) {
      console.error("Error loading flash sales:", e);
    }
  }

  // ========== RENDER FLASH SALE CARD ==========
  function renderFlashSaleCard(flashSale) {
    const now = new Date();
    const startTime = new Date(flashSale.startTime);
    const endTime = new Date(flashSale.endTime);
    
    let statusClass = "pending";
    let statusText = "Sắp diễn ra";
    let statusIcon = "⏰";
    
    if (now >= startTime && now <= endTime) {
      statusClass = "success";
      statusText = "Đang diễn ra";
      statusIcon = "⚡";
    } else if (now > endTime) {
      statusClass = "cancelled";
      statusText = "Đã kết thúc";
      statusIcon = "✅";
    }

    const dateTimeDisplay = formatFlashSaleDateTime(flashSale.startTime, flashSale.endTime);
    const revenue = flashSale.revenue || 0;
    const revenueDisplay = formatCurrency(revenue);

    const productsHTML = flashSale.products.map(product => {
      const productImage = product.image || "https://via.placeholder.com/60";
      const discountPercent = product.discount || 0;
      const originalPrice = product.originalPrice || product.price || 0;
      const salePrice = product.price || 0;
      const sold = product.sold || 0;
      const quantity = product.quantity || 0;
      const remaining = Math.max(0, quantity - sold);
      const soldPercent = quantity > 0 ? (sold / quantity * 100) : 0;

      return `
        <div style="display: flex; gap: 16px; padding: 12px; background: var(--bg); border-radius: 8px;">
          <img src="${productImage}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/60'" />
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
              <div>
                <div style="font-weight: 600; margin-bottom: 4px;">${product.name}</div>
                <div style="display: flex; gap: 8px; align-items: center;">
                  ${discountPercent > 0 ? `<span style="background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px;">-${discountPercent}%</span>` : ''}
                  <span style="color: var(--accent); font-weight: 600;">${formatCurrency(salePrice)}</span>
                  ${originalPrice > salePrice ? `<span style="text-decoration: line-through; color: var(--text-muted); font-size: 13px;">${formatCurrency(originalPrice)}</span>` : ''}
                </div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="flex: 1; height: 8px; background: var(--bg-elevated); border-radius: 4px; overflow: hidden;">
                <div style="width: ${Math.min(soldPercent, 100)}%; height: 100%; background: var(--accent);"></div>
              </div>
              <span style="font-size: 12px; color: var(--text-muted);">${sold}/${quantity || 0}</span>
              <span style="font-size: 12px;">Còn ${remaining} sản phẩm</span>
            </div>
          </div>
        </div>
      `;
    }).join("");

    return `
      <div class="card flashsale-card" style="padding: 20px; margin-bottom: 16px;" data-flashsale-id="${flashSale.id}">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="flashsale-toggle" style="background: none; border: none; color: var(--text); cursor: pointer; font-size: 16px; padding: 4px;">▼</button>
            <span>${statusIcon}</span>
            <h3 style="margin: 0;">${flashSale.name}</h3>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span class="status ${statusClass}">${statusText}</span>
            <label class="toggle-switch">
              <input type="checkbox" ${flashSale.status === "active" ? "checked" : ""} data-flashsale-id="${flashSale.id}" />
              <span class="slider"></span>
            </label>
            <div class="action-menu">
              <button class="action-toggle">⋯</button>
              <div class="action-dropdown">
                <button class="action-item" data-action="edit" data-flashsale-id="${flashSale.id}">✏️ Chỉnh sửa</button>
                <button class="action-item" data-action="duplicate" data-flashsale-id="${flashSale.id}">📑 Nhân bản</button>
                <button class="action-item danger" data-action="delete" data-flashsale-id="${flashSale.id}">🗑 Xóa</button>
              </div>
            </div>
          </div>
        </div>
        <div style="color: var(--text-muted); margin-bottom: 16px; font-size: 13px;">
          ${dateTimeDisplay}
        </div>
        
        <div class="flashsale-content" style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 16px;">
          ${productsHTML}
        </div>
        
        <div style="padding-top: 16px; border-top: 1px solid var(--border);">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-muted);">Doanh thu Flash Sale</span>
            <span style="font-weight: 600; color: var(--accent);">${revenueDisplay}</span>
          </div>
        </div>
      </div>
    `;
  }

  // ========== FORMAT DATE TIME ==========
  function formatFlashSaleDateTime(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    return `${formatDate(start)} - ${formatDate(end)}`;
  }

  // ========== ATTACH TOGGLE LISTENERS ==========
  function attachFlashSaleToggleListeners() {
    document.querySelectorAll(".flashsale-toggle").forEach((toggle) => {
      toggle.addEventListener("click", function() {
        const card = this.closest(".flashsale-card");
        const content = card.querySelector(".flashsale-content");
        const isExpanded = content.style.display !== "none";
        
        if (isExpanded) {
          content.style.display = "none";
          this.textContent = "▶";
        } else {
          content.style.display = "flex";
          this.textContent = "▼";
        }
      });
    });
  }

  // ========== CẬP NHẬT KPI ==========
  function updateFlashSaleKPIs() {
    try {
      const flashSales = JSON.parse(localStorage.getItem(FLASH_SALE_STORAGE_KEY) || "[]");
      const totalFlashSales = flashSales.length;
      
      const now = new Date();
      let activeCount = 0;
      let totalProducts = 0;
      let totalRevenue = 0;

      flashSales.forEach(flashSale => {
        const startTime = new Date(flashSale.startTime);
        const endTime = new Date(flashSale.endTime);
        
        if (now >= startTime && now <= endTime) {
          activeCount++;
        }
        
        totalProducts += flashSale.products?.length || 0;
        totalRevenue += flashSale.revenue || 0;
      });

      // Cập nhật KPI cards
      const kpiCards = document.querySelectorAll(".kpi-value");
      if (kpiCards.length >= 4) {
        kpiCards[0].textContent = totalFlashSales;
        kpiCards[1].textContent = activeCount;
        kpiCards[2].textContent = totalProducts;
        
        // Format revenue
        let revenueDisplay = "";
        if (totalRevenue >= 1000000000) {
          revenueDisplay = (totalRevenue / 1000000000).toFixed(1) + "B";
        } else if (totalRevenue >= 1000000) {
          revenueDisplay = (totalRevenue / 1000000).toFixed(1) + "M";
        } else if (totalRevenue >= 1000) {
          revenueDisplay = (totalRevenue / 1000).toFixed(1) + "K";
        } else {
          revenueDisplay = totalRevenue.toString();
        }
        kpiCards[3].textContent = revenueDisplay;
      }
    } catch (e) {
      console.error("Error updating KPI:", e);
    }
  }

  // Load products and flash sales on page load
  function initializeFlashSale() {
    console.log("Initializing Flash Sale...");
    console.log("flashSaleListContainer:", flashSaleListContainer);
    console.log("flashSaleEmptyState:", flashSaleEmptyState);
    
    loadAvailableProducts();
    loadFlashSales();
    updateFlashSaleKPIs();
  }

  // Gọi ngay khi DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFlashSale);
  } else {
    initializeFlashSale();
  }

  // Cũng gọi khi window load để đảm bảo
  window.addEventListener("load", () => {
    console.log("Window loaded, reloading flash sales...");
    loadFlashSales();
    updateFlashSaleKPIs();
  });
});
