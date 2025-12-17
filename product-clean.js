// Product management JavaScript - Clean version

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const itemsPerPage = 10;
let viewMode = "list";
let editingProductId = null;
const defaultCategories = [
  "Điện thoại",
  "Laptop",
  "Máy tính bảng",
  "Linh kiện",
  "Phụ kiện",
  "Khác",
];

// Field definitions for each category
const categoryFieldConfigs = {
  "Quần áo": [
    {
      name: "size",
      label: "Size",
      type: "select",
      options: ["S", "M", "L", "XL", "XXL"],
      required: true,
    },
    {
      name: "color",
      label: "Màu sắc",
      type: "text",
      placeholder: "Đỏ, xanh, đen...",
    },
    {
      name: "material",
      label: "Chất liệu",
      type: "text",
      placeholder: "Cotton, denim...",
    },
    {
      name: "descriptionDetail",
      label: "Mô tả chi tiết",
      type: "textarea",
      rows: 3,
      placeholder: "Form, hướng dẫn giặt ủi...",
    },
  ],
  "Điện thoại": [
    {
      name: "brand",
      label: "Hãng",
      type: "text",
      placeholder: "Apple, Samsung...",
    },
    {
      name: "model",
      label: "Model",
      type: "text",
      placeholder: "iPhone 15 Pro...",
    },
    {
      name: "storage",
      label: "Dung lượng",
      type: "text",
      placeholder: "128GB, 256GB...",
    },
    {
      name: "warranty",
      label: "Bảo hành",
      type: "text",
      placeholder: "12 tháng",
    },
  ],
  Laptop: [
    { name: "brand", label: "Hãng", type: "text", placeholder: "Dell, HP..." },
    { name: "cpu", label: "CPU", type: "text", placeholder: "i5-1240P..." },
    { name: "ram", label: "RAM", type: "text", placeholder: "16GB" },
    {
      name: "storage",
      label: "Ổ cứng",
      type: "text",
      placeholder: "512GB SSD",
    },
    { name: "gpu", label: "GPU", type: "text", placeholder: "RTX 4050..." },
  ],
  "Máy tính bảng": [
    {
      name: "brand",
      label: "Hãng",
      type: "text",
      placeholder: "Apple, Samsung...",
    },
    {
      name: "model",
      label: "Model",
      type: "text",
      placeholder: "iPad Air 5...",
    },
    {
      name: "storage",
      label: "Dung lượng",
      type: "text",
      placeholder: "64GB...",
    },
    {
      name: "warranty",
      label: "Bảo hành",
      type: "text",
      placeholder: "12 tháng",
    },
  ],
  "Linh kiện": [
    {
      name: "componentType",
      label: "Loại linh kiện",
      type: "text",
      placeholder: "RAM, SSD, PSU...",
    },
    {
      name: "compatibility",
      label: "Tương thích",
      type: "text",
      placeholder: "Laptop, PC, main XYZ...",
    },
    {
      name: "warranty",
      label: "Bảo hành",
      type: "text",
      placeholder: "12 tháng",
    },
  ],
  "Phụ kiện": [
    {
      name: "accessoryType",
      label: "Loại phụ kiện",
      type: "text",
      placeholder: "Ốp lưng, sạc, cáp...",
    },
    {
      name: "compatibility",
      label: "Tương thích",
      type: "text",
      placeholder: "iPhone 15, USB-C...",
    },
    {
      name: "color",
      label: "Màu sắc",
      type: "text",
      placeholder: "Đen, trắng...",
    },
  ],
  Khác: [
    {
      name: "notes",
      label: "Thông tin bổ sung",
      type: "textarea",
      rows: 3,
      placeholder: "Ghi chú thêm về sản phẩm...",
    },
  ],
};

document.addEventListener("DOMContentLoaded", () => {
  initializeProductPage();
});

function initializeProductPage() {
  const btnAddProduct = document.querySelector(".btn-add");
  const modal = document.getElementById("productModal");
  const detailModal = document.getElementById("productDetailModal");
  const closeModal = document.querySelector(".modal-close");
  const cancelBtn = document.querySelector(".btn-cancel");
  const detailCloseBtns = document.querySelectorAll(".detail-close");
  const productForm = document.getElementById("productForm");
  const modalTitle = document.querySelector("#productModal h2");
  const submitBtn = productForm
    ? productForm.querySelector(".btn-submit")
    : null;
  const imageUpload = document.getElementById("imageUpload");
  const imagePreview = document.getElementById("imagePreview");
  const imagePreviewImg = document.getElementById("imagePreviewImg");
  const categorySelect = document.querySelector('select[name="category"]');
  const searchInput =
    document.querySelector("#productSearch") ||
    document.querySelector(".search-input") ||
    document.querySelector(".topbar .search-input");
  const clearSearchBtn = document.getElementById("clearSearch");
  const categoryFilter = document.querySelectorAll(".filter-select")[0];
  const statusFilter = document.querySelectorAll(".filter-select")[1];
  const viewButtons = document.querySelectorAll(".view-btn");
  const tableWrapper = document.querySelector(".table-wrapper");
  const gridContainer = document.getElementById("productGrid");
  const paginationContainer = document.querySelector(".pagination-container");
  const badgeProductCount = document.querySelector(
    ".nav-item.active .nav-badge.gray"
  );

  setupActionMenuHandler();

  // Load all products
  loadAllProducts();
  syncCategories(categorySelect, categoryFilter);

  // Open modal
  if (btnAddProduct) {
    btnAddProduct.addEventListener("click", () => {
      if (modal) modal.style.display = "flex";
    });
  }

  // Close modal
  const closeModalFunc = () => {
    if (modal) modal.style.display = "none";
    if (productForm) productForm.reset();
    if (imagePreview) {
      imagePreview.style.display = "none";
      const uploadIcon = document.querySelector(".image-upload-icon");
      if (uploadIcon) uploadIcon.style.display = "block";
    }
    if (imageUpload) imageUpload.value = "";
    editingProductId = null;
    resetFormMode(modalTitle, submitBtn);
  };
  const closeDetailModal = () => {
    if (detailModal) detailModal.style.display = "none";
  };

  if (closeModal) closeModal.addEventListener("click", closeModalFunc);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModalFunc);
  detailCloseBtns.forEach((btn) =>
    btn.addEventListener("click", () => closeDetailModal())
  );

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModalFunc();
    }
    if (e.target === detailModal) {
      closeDetailModal();
    }
  });

  // Image upload preview
  if (imageUpload) {
    imageUpload.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          alert("Vui lòng chọn file ảnh hợp lệ!");
          imageUpload.value = "";
          return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert("Kích thước file không được vượt quá 5MB!");
          imageUpload.value = "";
          return;
        }
        
        if (imagePreviewImg) {
          const reader = new FileReader();
          reader.onload = (e) => {
            imagePreviewImg.src = e.target.result;
            if (imagePreview) {
              imagePreview.style.display = "block";
              // Hide the upload icon when image is shown
              const uploadIcon = document.querySelector(".image-upload-icon");
              if (uploadIcon) uploadIcon.style.display = "none";
            }
          };
          reader.onerror = () => {
            alert("Lỗi khi đọc file ảnh!");
            imageUpload.value = "";
          };
          reader.readAsDataURL(file);
        }
      }
    });
  }

  // Form submit
  if (productForm) {
    productForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      // Validate required fields
      const productName = productForm.querySelector('[name="productName"]');
      const category = productForm.querySelector('[name="category"]');
      const price = productForm.querySelector('[name="price"]');
      const quantity = productForm.querySelector('[name="quantity"]');
      
      // Check if form is valid
      if (!productForm.checkValidity()) {
        productForm.reportValidity();
        return;
      }
      
      // Additional validation
      if (!productName || !productName.value.trim()) {
        alert("Vui lòng nhập tên sản phẩm!");
        productName?.focus();
        return;
      }
      
      if (!category || !category.value) {
        alert("Vui lòng chọn danh mục!");
        category?.focus();
        return;
      }
      
      if (!price || !price.value || parseFloat(price.value) <= 0) {
        alert("Vui lòng nhập giá bán hợp lệ!");
        price?.focus();
        return;
      }
      
      if (!quantity || !quantity.value || parseInt(quantity.value) < 0) {
        alert("Vui lòng nhập số lượng hợp lệ!");
        quantity?.focus();
        return;
      }
      
      // Get imagePreviewImg again to ensure it's available
      const currentImagePreviewImg = document.getElementById("imagePreviewImg");
      
      handleAddProduct(productForm, currentImagePreviewImg || imagePreviewImg, closeModalFunc);
    });
  }

  // Category-specific fields in modal
  if (categorySelect) {
    renderDynamicFields(categorySelect.value);
    categorySelect.addEventListener("change", (e) => {
      renderDynamicFields(e.target.value);
    });
  }

  // Search functionality
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      if (clearSearchBtn) {
        clearSearchBtn.style.display = searchInput.value.trim() ? "block" : "none";
      }
      filterProducts();
    });
    
    // Show/hide clear button on focus/blur
    searchInput.addEventListener("focus", () => {
      if (clearSearchBtn && searchInput.value.trim()) {
        clearSearchBtn.style.display = "block";
      }
    });
  }
  if (clearSearchBtn && searchInput) {
    clearSearchBtn.addEventListener("click", () => {
      searchInput.value = "";
      clearSearchBtn.style.display = "none";
      filterProducts();
      searchInput.focus();
    });
  }

  // Category filter
  if (categoryFilter) {
    categoryFilter.addEventListener("change", () => {
      filterProducts();
    });
  }

  // Status filter
  if (statusFilter) {
    statusFilter.addEventListener("change", () => {
      filterProducts();
    });
  }

  // View toggle buttons (UI only)
  if (viewButtons.length) {
    viewButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        viewButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        viewMode = btn.dataset.view || "list";
        renderCurrentView();
      });
    });
  }
}

function renderCurrentView() {
  const tableWrapper = document.querySelector(".table-wrapper");
  const gridContainer = document.getElementById("productGrid");
  const paginationContainer = document.querySelector(".pagination-container");

  if (viewMode === "grid") {
    if (tableWrapper) tableWrapper.style.display = "none";
    if (paginationContainer) paginationContainer.style.display = "none";
    if (gridContainer) gridContainer.style.display = "grid";
    renderGrid(filteredProducts.length ? filteredProducts : allProducts);
  } else {
    if (tableWrapper) tableWrapper.style.display = "block";
    if (paginationContainer) paginationContainer.style.display = "flex";
    if (gridContainer) gridContainer.style.display = "none";
    // Re-render list with pagination
    displayProducts(filteredProducts.length ? filteredProducts : allProducts, {
      skipViewSync: true,
    });
  }
}

function getFieldsForCategory(category) {
  return categoryFieldConfigs[category] || categoryFieldConfigs["Khác"];
}

function getCategoryNames() {
  const stored = JSON.parse(localStorage.getItem("categories") || "[]");
  const storedNames = stored.map((c) => c.name).filter(Boolean);
  const all = [...defaultCategories, ...storedNames];
  // unique while preserving order
  return [...new Set(all)];
}

function syncCategories(categorySelect, categoryFilter) {
  const names = getCategoryNames();
  if (categorySelect) {
    const current = categorySelect.value;
    categorySelect.innerHTML =
      `<option value="">Chọn danh mục</option>` +
      names.map((n) => `<option value="${n}">${n}</option>`).join("");
    if (names.includes(current)) categorySelect.value = current;
  }
  if (categoryFilter) {
    const current = categoryFilter.value;
    categoryFilter.innerHTML =
      `<option value="">Tất cả danh mục</option>` +
      names.map((n) => `<option value="${n}">${n}</option>`).join("");
    if (names.includes(current)) categoryFilter.value = current;
  }
}

function renderDynamicFields(category) {
  const container = document.getElementById("categoryFields");
  if (!container) return;

  container.innerHTML = "";
  const fields = getFieldsForCategory(category);

  fields.forEach((field) => {
    const group = document.createElement("div");
    group.className = "form-group";

    const label = document.createElement("label");
    label.textContent = field.label + (field.required ? " *" : "");
    group.appendChild(label);

    let input;
    if (field.type === "select") {
      input = document.createElement("select");
      input.name = `attr_${field.name}`;
      if (field.required) input.required = true;
      const emptyOpt = document.createElement("option");
      emptyOpt.value = "";
      emptyOpt.textContent = "Chọn";
      input.appendChild(emptyOpt);
      field.options.forEach((opt) => {
        const option = document.createElement("option");
        option.value = opt;
        option.textContent = opt;
        input.appendChild(option);
      });
    } else if (field.type === "textarea") {
      input = document.createElement("textarea");
      input.name = `attr_${field.name}`;
      input.rows = field.rows || 3;
      input.placeholder = field.placeholder || "";
    } else {
      input = document.createElement("input");
      input.type = "text";
      input.name = `attr_${field.name}`;
      input.placeholder = field.placeholder || "";
    }

    group.appendChild(input);
    container.appendChild(group);
  });
}

function collectAttributes(form, category) {
  const fields = getFieldsForCategory(category);
  const attributes = {};

  fields.forEach((field) => {
    const input = form.querySelector(`[name="attr_${field.name}"]`);
    if (!input) return;
    const value = input.value || "";
    if (value.trim() !== "") {
      attributes[field.name] = value.trim();
    }
  });

  return attributes;
}

function handleAddProduct(form, imagePreviewImg, closeModalFunc) {
  try {
    const formData = new FormData(form);
    const quantity = parseInt(formData.get("quantity")) || 0;
    const category = formData.get("category") || "Khác";
    const productName = formData.get("productName")?.trim();
    const price = formData.get("price");
    
    // Validate required fields
    if (!productName) {
      alert("Vui lòng nhập tên sản phẩm!");
      return;
    }
    
    if (!category || category === "") {
      alert("Vui lòng chọn danh mục!");
      return;
    }
    
    if (!price || parseFloat(price) <= 0) {
      alert("Vui lòng nhập giá bán hợp lệ!");
      return;
    }
    
    if (isNaN(quantity) || quantity < 0) {
      alert("Vui lòng nhập số lượng hợp lệ!");
      return;
    }
    
    const nowId = Date.now().toString();

    let status = "success";
    let statusText = "Đang bán";

    if (quantity <= 5 && quantity > 0) {
      status = "pending";
      statusText = "Sắp hết";
    }
    if (quantity === 0) {
      status = "cancelled";
      statusText = "Hết hàng";
    }

    // Get image URL safely
    let imageUrl = "https://via.placeholder.com/40";
    if (imagePreviewImg && imagePreviewImg.src && imagePreviewImg.src !== window.location.href) {
      imageUrl = imagePreviewImg.src;
    }

    const productPayload = {
      name: productName,
      sku: formData.get("sku")?.trim() || `SKU-${nowId}`,
      category: category,
      price: parseFloat(price) || 0,
      originalPrice: parseFloat(formData.get("originalPrice")) || parseFloat(price) || 0,
      quantity: quantity,
      description: formData.get("description")?.trim() || "",
      image: imageUrl,
      sold: 0,
      status: status,
      statusText: statusText,
      attributes: collectAttributes(form, category),
    };

    let products = JSON.parse(localStorage.getItem("products") || "[]");

    if (editingProductId) {
      const idx = products.findIndex((p) => p.id === editingProductId);
      if (idx !== -1) {
        products[idx] = {
          ...products[idx],
          ...productPayload,
          id: editingProductId,
        };
        localStorage.setItem("products", JSON.stringify(products));
        
        // Reset filters to show all products
        const searchInput = document.querySelector("#productSearch") || document.querySelector(".search-input");
        const categoryFilter = document.querySelectorAll(".filter-select")[0];
        const statusFilter = document.querySelectorAll(".filter-select")[1];
        
        if (searchInput) searchInput.value = "";
        if (categoryFilter) categoryFilter.value = "";
        if (statusFilter) statusFilter.value = "";
        
        // Reload all products
        loadAllProducts();
        
        // Close modal and reset form
        closeModalFunc();
        
        // Show success message
        alert("Cập nhật sản phẩm thành công!");
      } else {
        alert("Không tìm thấy sản phẩm để cập nhật!");
      }
    } else {
      const product = {
        id: productPayload.sku !== `SKU-${nowId}` ? productPayload.sku : `PRD-${nowId}`,
        ...productPayload,
      };

      // Get existing products from localStorage
      products.push(product);
      localStorage.setItem("products", JSON.stringify(products));

      // Reset filters to show all products
      const searchInput = document.querySelector("#productSearch") || document.querySelector(".search-input");
      const categoryFilter = document.querySelectorAll(".filter-select")[0];
      const statusFilter = document.querySelectorAll(".filter-select")[1];
      
      if (searchInput) searchInput.value = "";
      if (categoryFilter) categoryFilter.value = "";
      if (statusFilter) statusFilter.value = "";

      // Calculate which page the new product will be on
      const totalProducts = products.length;
      const newProductPage = Math.ceil(totalProducts / itemsPerPage);

      // Set current page to the page with the new product
      currentPage = newProductPage;

      // Reload all products immediately
      loadAllProducts();
      
      // Force a re-render after a short delay to ensure DOM is updated
      setTimeout(() => {
        // Double-check that products are displayed
        const tbody = document.querySelector("#productTable");
        const currentProducts = JSON.parse(localStorage.getItem("products") || "[]");
        if (tbody && currentProducts.length > 0) {
          // If table is empty but we have products, force reload
          const visibleRows = tbody.querySelectorAll("tr:not(.empty-row)");
          if (visibleRows.length === 0 || (visibleRows.length === 1 && visibleRows[0].querySelector("td[colspan]"))) {
            loadAllProducts();
          }
        }
      }, 50);

      // Close modal and reset form
      closeModalFunc();

      // Show success message
      alert("Thêm sản phẩm thành công!");
    }
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm:", error);
    alert("Đã xảy ra lỗi khi thêm sản phẩm. Vui lòng thử lại!");
  }
}

function loadAllProducts() {
  // Get products from localStorage, default to empty array
  allProducts = JSON.parse(localStorage.getItem("products") || "[]");
  // Ensure products have id
  let changed = false;
  allProducts = allProducts.map((p) => {
    if (!p.id) {
      changed = true;
      return { ...p, id: `${p.sku || "prd"}-${Date.now()}-${Math.random()}` };
    }
    return p;
  });
  if (changed) {
    localStorage.setItem("products", JSON.stringify(allProducts));
  }
  // Reset filtered products to show all products
  filteredProducts = [...allProducts];
  
  // Force display update
  displayProducts(filteredProducts, { forceUpdate: true });
  updateProductBadge();
}

function displayProducts(products, options = {}) {
  filteredProducts = products;
  const totalPages = Math.ceil(products.length / itemsPerPage) || 1;

  // Reset to page 1 if current page is out of range
  if (currentPage > totalPages && products.length > 0) {
    currentPage = 1;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const tbody = document.querySelector("#productTable");
  if (!tbody) {
    console.warn("Product table body not found!");
    return;
  }

  // If grid view active, render grid and bail out (pagination hidden)
  if (viewMode === "grid" && !options.skipViewSync) {
    renderGrid(products); // Render all products in grid view
    return;
  }

  // Clear table body
  tbody.innerHTML = "";

  // Show message if no products
  if (products.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td colspan="9" style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.6;">📦</div>
        <div style="font-size: 16px; margin-bottom: 8px; color: var(--text);">Chưa có sản phẩm nào</div>
        <div style="font-size: 14px;">Nhấn "Thêm sản phẩm" để bắt đầu</div>
      </td>
    `;
    tbody.appendChild(tr);
  } else {
    // Add actual products
    currentProducts.forEach((product, index) => {
      const globalIndex = startIndex + index + 1;
      const tr = document.createElement("tr");
      tr.dataset.id = product.id;
      const priceBlock = `
        <div class="price-block">
          <div class="price-current">${formatPrice(product.price)}</div>
          ${
            product.originalPrice && product.originalPrice !== product.price
              ? `<div class="price-old">${formatPrice(
                  product.originalPrice
                )}</div>`
              : ""
          }
        </div>
      `;
      const rating = product.rating || "4.8";
      
      // Determine stock class based on quantity
      let stockClass = "";
      if (product.quantity === 0) {
        stockClass = "stock-empty";
      } else if (product.quantity <= 5) {
        stockClass = "stock-low";
      }

      tr.innerHTML = `
        <td class="cell-checkbox">
          <input type="checkbox" class="row-check" data-id="${product.id}" />
        </td>
        <td>
          <div class="product-cell">
            <img
              src="${product.image}"
              alt="Product"
              class="product-thumb"
              onerror="this.src='https://via.placeholder.com/40'"
            />
            <div class="product-info">
              <div class="product-name">${product.name}</div>
              <div class="product-meta">⭐ ${rating}</div>
            </div>
          </div>
        </td>
        <td>${product.sku}</td>
        <td><span class="badge category">${product.category}</span></td>
        <td>${priceBlock}</td>
        <td class="cell-center ${stockClass}">${product.quantity}</td>
        <td class="cell-center">${product.sold}</td>
        <td><span class="status ${product.status}">${product.statusText}</span></td>
        <td class="cell-right">
          <div class="action-menu">
            <button type="button" class="action-toggle" aria-label="Thao tác">⋯</button>
            <div class="action-dropdown">
              <button class="action-item" data-action="view">👁 Xem chi tiết</button>
              <button class="action-item" data-action="edit">✏️ Chỉnh sửa</button>
              <button class="action-item" data-action="duplicate">📑 Nhân bản</button>
              <button class="action-item danger" data-action="delete" data-product-id="${product.id}">🗑 Xóa sản phẩm</button>
            </div>
          </div>
        </td>
      `;
      tr.addEventListener("click", (e) => {
        const isToggle =
          e.target.closest(".action-menu") ||
          e.target.closest(".action-toggle") ||
          e.target.closest(".action-item") ||
          e.target.closest(".row-check") ||
          e.target.closest("#checkAll");
        if (isToggle) return;
        openProductDetail(product.id);
      });
      tbody.appendChild(tr);
    });

    // Fill remaining rows to make table always show 10 rows per page
    const remainingRows = itemsPerPage - currentProducts.length;
    for (let i = 0; i < remainingRows; i++) {
      const tr = document.createElement("tr");
      tr.className = "empty-row";
      tr.innerHTML = `
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
      `;
      tbody.appendChild(tr);
    }
  }

  updatePagination(totalPages);
}

function setupActionMenuHandler() {
  // Remove existing listener if any (prevent duplicates)
  document.removeEventListener("click", handleActionMenuClick);
  document.addEventListener("click", handleActionMenuClick);
}

function handleActionMenuClick(e) {
  const toggle = e.target.closest(".action-toggle");
  const menu = e.target.closest(".action-menu");
  const item = e.target.closest(".action-item");

  // Click on toggle button
  if (toggle && menu) {
    e.stopPropagation();
    const isOpen = menu.classList.contains("open");
    document
      .querySelectorAll(".action-menu.open")
      .forEach((m) => m.classList.remove("open"));
    if (!isOpen) {
      menu.classList.add("open");
    }
    return;
  }

  // Click on action item
  if (item) {
    e.stopPropagation();
    e.preventDefault();
    
    const menu = item.closest(".action-menu");
    if (menu) {
      menu.classList.remove("open");
    }
    
    const action = item.getAttribute("data-action");
    // Lấy productId từ data-product-id trên button trước, nếu không có thì lấy từ row
    let productId = item.getAttribute("data-product-id");
    if (!productId) {
      const row = item.closest("tr");
      productId = row?.dataset?.id;
    }
    
    console.log("Action clicked:", action, "Product ID:", productId);
    
    if (!productId) {
      console.error("Không tìm thấy productId!");
      alert("Không tìm thấy ID sản phẩm!");
      return;
    }
    
    if (action === "view") {
      openProductDetail(productId);
    } else if (action === "delete") {
      deleteProductDirect(productId);
    } else if (action === "edit") {
      openEditProduct(productId);
    } else if (action === "duplicate") {
      duplicateProduct(productId);
    } else {
      alert("Chức năng sẽ được bổ sung.");
    }
    return;
  }

  // Click outside -> close all menus
  if (!e.target.closest(".action-menu")) {
    document
      .querySelectorAll(".action-menu.open")
      .forEach((m) => m.classList.remove("open"));
  }
}

function openProductDetail(productId) {
  const product =
    allProducts.find((p) => p.id === productId) ||
    filteredProducts.find((p) => p.id === productId);
  const detailModal = document.getElementById("productDetailModal");
  if (!product || !detailModal) return;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "—";
  };
  const setImage = (id, src) => {
    const el = document.getElementById(id);
    if (el) {
      el.src = src || "https://via.placeholder.com/200";
      el.onerror = () => (el.src = "https://via.placeholder.com/200");
    }
  };

  setText("detailName", product.name);
  setText("detailCategory", product.category);
  setText("detailCategory2", product.category);
  setText("detailSku", product.sku);
  setText("detailPrice", formatPrice(product.price));
  setText("detailQuantity", product.quantity);
  setText("detailDescription", product.description || "—");
  setImage("detailImage", product.image);

  const attrWrap = document.getElementById("detailAttributes");
  if (attrWrap) {
    attrWrap.innerHTML = "";
    const attrs = product.attributes || {};
    const keys = Object.keys(attrs);
    if (keys.length === 0) {
      const empty = document.createElement("div");
      empty.className = "detail-value";
      empty.textContent = "Không có thuộc tính thêm.";
      attrWrap.appendChild(empty);
    } else {
      keys.forEach((key) => {
        const item = document.createElement("div");
        item.className = "detail-attr-item";
        item.innerHTML = `
          <div class="detail-attr-label">${key}</div>
          <div class="detail-attr-value">${attrs[key]}</div>
        `;
        attrWrap.appendChild(item);
      });
    }
  }

  detailModal.style.display = "flex";
}

function openEditProduct(productId) {
  const product =
    allProducts.find((p) => p.id === productId) ||
    filteredProducts.find((p) => p.id === productId);
  const modal = document.getElementById("productModal");
  const modalTitle = document.querySelector("#productModal h2");
  const submitBtn = modal ? modal.querySelector(".btn-submit") : null;
  if (!product || !modal) return;

  editingProductId = productId;
  setFormMode("edit", modalTitle, submitBtn);
  fillProductForm(product);
  modal.style.display = "flex";
}

function duplicateProduct(productId) {
  const product =
    allProducts.find((p) => p.id === productId) ||
    filteredProducts.find((p) => p.id === productId);
  if (!product) return;

  const copy = {
    ...product,
    id: `${product.id}-copy-${Date.now()}`,
    name: product.name, // Giữ nguyên tên, không thêm (Copy)
    sku: product.sku ? `${product.sku}-COPY` : `COPY-${Date.now()}`,
  };

  const products = JSON.parse(localStorage.getItem("products") || "[]");
  products.push(copy);
  localStorage.setItem("products", JSON.stringify(products));
  loadAllProducts();
  alert("Đã nhân bản sản phẩm.");
}

// Hàm xóa trực tiếp từ nút inline (cách mới - đơn giản hơn)
function deleteProductDirect(productId) {
  if (!productId) {
    alert("Không tìm thấy ID sản phẩm!");
    return;
  }

  // Get products from localStorage
  let products = JSON.parse(localStorage.getItem("products") || "[]");
  
  // Find product to get name for confirmation
  const product = products.find((p) => p.id === productId);
  
  if (!product) {
    alert("Không tìm thấy sản phẩm để xóa!");
    return;
  }

  // Confirm deletion
  const confirmMessage = `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?\n\nHành động này không thể hoàn tác!`;
  
  if (!confirm(confirmMessage)) {
    return; // User cancelled
  }

  try {
    // Remove product by id
    products = products.filter((p) => p.id !== productId);
    
    // Save back to localStorage
    localStorage.setItem("products", JSON.stringify(products));
    
    // Reset filters
    const searchInput = document.querySelector("#productSearch") || document.querySelector(".search-input");
    const categoryFilter = document.querySelectorAll(".filter-select")[0];
    const statusFilter = document.querySelectorAll(".filter-select")[1];
    
    if (searchInput) searchInput.value = "";
    if (categoryFilter) categoryFilter.value = "";
    if (statusFilter) statusFilter.value = "";
    
    // Reset to page 1 if current page is empty after deletion
    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / itemsPerPage) || 1;
    if (currentPage > totalPages && totalPages > 0) {
      currentPage = totalPages;
    } else if (totalPages === 0) {
      currentPage = 1;
    }
    
    // Reload all products
    loadAllProducts();
    
    // Show success message
    alert(`Đã xóa sản phẩm "${product.name}" thành công!`);
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    alert("Đã xảy ra lỗi khi xóa sản phẩm. Vui lòng thử lại!");
  }
}

function deleteProduct(productId) {
  // Gọi hàm xóa trực tiếp
  deleteProductDirect(productId);
}

function setFormMode(mode, modalTitle, submitBtn) {
  if (mode === "edit") {
    if (modalTitle) modalTitle.textContent = "Chỉnh sửa sản phẩm";
    if (submitBtn) submitBtn.textContent = "Lưu thay đổi";
  } else {
    if (modalTitle) modalTitle.textContent = "Thêm sản phẩm mới";
    if (submitBtn) submitBtn.textContent = "Thêm sản phẩm";
  }
}

function resetFormMode(modalTitle, submitBtn) {
  setFormMode("add", modalTitle, submitBtn);
}

function fillProductForm(product) {
  const modal = document.getElementById("productModal");
  if (!modal) return;
  const form = modal.querySelector("form");
  if (!form) return;

  const imagePreview = document.getElementById("imagePreview");
  const imagePreviewImg = document.getElementById("imagePreviewImg");
  const categorySelect = form.querySelector('select[name="category"]');

  form.elements["productName"].value = product.name || "";
  form.elements["sku"].value = product.sku || "";
  form.elements["price"].value = product.price || "";
  form.elements["originalPrice"].value = product.originalPrice || "";
  form.elements["quantity"].value = product.quantity || 0;
  form.elements["description"].value = product.description || "";
  if (categorySelect) {
    categorySelect.value = product.category || "";
    renderDynamicFields(categorySelect.value);
  }

  // Fill dynamic attributes
  const attrs = product.attributes || {};
  Object.keys(attrs).forEach((key) => {
    const input = form.querySelector(`[name="attr_${key}"]`);
    if (input) input.value = attrs[key];
  });

  // Preview image
  if (product.image && imagePreviewImg && imagePreview) {
    imagePreviewImg.src = product.image;
    imagePreview.style.display = "block";
  }
}

// Selection helpers
document.addEventListener("change", (e) => {
  if (e.target.id === "checkAll") {
    const checked = e.target.checked;
    document
      .querySelectorAll(".row-check")
      .forEach((cb) => (cb.checked = checked));
  }
});

function filterProducts() {
  const searchInput = document.querySelector(".search-input");
  const categoryFilter = document.querySelectorAll(".filter-select")[0];
  const statusFilter = document.querySelectorAll(".filter-select")[1];

  const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
  const selectedCategory = categoryFilter ? categoryFilter.value : "";
  const selectedStatus = statusFilter ? statusFilter.value : "";

  let filtered = allProducts.filter((product) => {
    const matchSearch =
      product.name.toLowerCase().includes(searchTerm) ||
      product.sku.toLowerCase().includes(searchTerm);

    const matchCategory =
      !selectedCategory ||
      product.category.toLowerCase() === selectedCategory.toLowerCase();

    let matchStatus = true;
    if (selectedStatus === "dangban") {
      matchStatus = product.status === "success";
    } else if (selectedStatus === "saphet") {
      matchStatus = product.status === "pending";
    } else if (selectedStatus === "tamngung") {
      matchStatus = product.status === "cancelled";
    }

    return matchSearch && matchCategory && matchStatus;
  });

  currentPage = 1; // Reset to first page when filtering
  displayProducts(filtered);
}

function updatePagination(totalPages) {
  const paginationContainer = document.querySelector(".pagination-container");
  if (!paginationContainer) return;

  const totalProducts = filteredProducts.length;
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalProducts);
  
  let paginationHTML = `<span>Hiển thị ${startIndex}-${endIndex} trong tổng số ${totalProducts} sản phẩm</span>`;

  // Previous button
  if (currentPage > 1) {
    paginationHTML += `<button class="btn-sm" onclick="changePage(${
      currentPage - 1
    })">Trước</button>`;
  }

  // Page numbers
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    const activeClass = i === currentPage ? "active" : "";
    paginationHTML += `<button class="btn-sm ${activeClass}" onclick="changePage(${i})">${i}</button>`;
  }

  // Next button
  if (currentPage < totalPages) {
    paginationHTML += `<button class="btn-sm" onclick="changePage(${
      currentPage + 1
    })">Sau</button>`;
  }

  paginationContainer.innerHTML = paginationHTML;
}

function changePage(page) {
  currentPage = page;
  displayProducts(filteredProducts);
}

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

// Reset products only
function resetAllData() {
  if (confirm("Bạn có chắc muốn xóa tất cả sản phẩm?")) {
    localStorage.removeItem("products");
    currentPage = 1;
    loadAllProducts();
  }
}

function updateProductBadge() {
  const badge =
    document.querySelector(
      ".nav-item[href='sanpham-full.html'] .nav-badge.gray"
    ) || document.querySelector(".nav-item.active .nav-badge.gray");
  if (!badge) return;
  const count = JSON.parse(localStorage.getItem("products") || "[]").length;
  badge.textContent = count;
}

function renderGrid(products) {
  const grid = document.getElementById("productGrid");
  if (!grid) return;
  grid.innerHTML = "";

  if (products.length === 0) {
    const empty = document.createElement("div");
    empty.className = "detail-value";
    empty.style.padding = "24px";
    empty.textContent =
      'Chưa có sản phẩm nào. Nhấn "Thêm sản phẩm mới" để bắt đầu.';
    grid.appendChild(empty);
    return;
  }

  products.forEach((p) => {
    const statusClass =
      p.status === "pending"
        ? "card-status soon"
        : p.status === "cancelled"
        ? "card-status stop"
        : "card-status";
    const card = document.createElement("div");
    card.className = "product-card";
    card.dataset.id = p.id;
    card.innerHTML = `
      <img src="${p.image}" alt="${
      p.name
    }" class="card-image" onerror="this.src='https://via.placeholder.com/400x300'"/>
      <div class="card-body-mini">
        <div class="card-meta-row">
          <span class="${statusClass}">${p.statusText}</span>
          <span style="color: var(--text-muted); font-size: 12px;">Kho: ${
            p.quantity
          } · Đã bán: ${p.sold}</span>
        </div>
        <div class="card-name">${p.name}</div>
        <div class="card-meta-row">
          <span class="card-price">${formatPrice(p.price)}</span>
          <span style="color: var(--text-muted); font-size: 12px;">⭐ ${
            p.rating || "4.8"
          }</span>
        </div>
      </div>
    `;
    card.addEventListener("click", () => openProductDetail(p.id));
    grid.appendChild(card);
  });
}
