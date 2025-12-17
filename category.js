// Category management JavaScript

let editingCategoryId = null;

const defaultCategoriesSeed = [
  { id: "dm01", name: "Điện thoại", code: "DM01", icon: "📱", parent: "", description: "", productCount: 177 },
  { id: "dm02", name: "Laptop", code: "DM02", icon: "💻", parent: "", description: "", productCount: 48 },
  { id: "dm03", name: "Máy tính bảng", code: "DM03", icon: "⌚", parent: "", description: "", productCount: 32 },
  { id: "dm04", name: "Phụ kiện", code: "DM04", icon: "🎧", parent: "", description: "", productCount: 18 },
  { id: "dm05", name: "Đồng hồ, Smartwatch", code: "DM05", icon: "🖥️", parent: "Đồng hồ, Smartwatch", description: "", productCount: 15 },
];

document.addEventListener("DOMContentLoaded", () => {
  const btnAddCategory = document.getElementById("btnAddCategory");
  const modal = document.getElementById("categoryModal");
  const closeModal = document.querySelector(".modal-close");
  const cancelBtn = document.querySelector(".btn-cancel");
  const categoryForm = document.getElementById("categoryForm");
  const searchInput = document.getElementById("categorySearch") || document.getElementById("categorySearchTopbar");
  const clearSearchBtn = document.getElementById("clearCategorySearch");
  const modalTitle = modal ? modal.querySelector("h2") : null;

  // Open modal
  if (btnAddCategory) {
    btnAddCategory.addEventListener("click", () => {
      editingCategoryId = null;
      setCategoryFormMode(modalTitle, categoryForm, "add");
      modal.style.display = "flex";
    });
  }

  // Close modal
  const closeModalFunc = () => {
    modal.style.display = "none";
    categoryForm.reset();
    editingCategoryId = null;
    setCategoryFormMode(modalTitle, categoryForm, "add");
  };

  if (closeModal) closeModal.addEventListener("click", closeModalFunc);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModalFunc);

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModalFunc();
    }
  });

  // Search - hỗ trợ cả search trong topbar và filter-group
  const categorySearchTopbar = document.getElementById("categorySearchTopbar");
  const allSearchInputs = [searchInput, categorySearchTopbar].filter(Boolean);
  
  const handleSearch = (value) => {
    filterCategories(value);
    // Đồng bộ giá trị giữa các search input
    allSearchInputs.forEach(input => {
      if (input) input.value = value;
    });
  };
  
  allSearchInputs.forEach(input => {
    if (input) {
      input.addEventListener("input", (e) => {
        handleSearch(e.target.value);
      });
    }
  });
  
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      handleSearch("");
      allSearchInputs.forEach(input => {
        if (input) input.focus();
      });
    });
  }

  // Form submit
  if (categoryForm) {
    categoryForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Get form data
      const formData = new FormData(categoryForm);
      const payload = {
        id: editingCategoryId || `cat-${Date.now()}`,
        name: formData.get("categoryName"),
        code: formData.get("categoryCode"),
        icon: formData.get("icon") || "📦",
        parent: formData.get("parentCategory"),
        description: formData.get("description"),
        productCount: 0,
        status: "success",
        statusText: "Đang bán",
      };

      // Get existing categories from localStorage
      let categories = JSON.parse(localStorage.getItem("categories") || "[]");
      const idx = categories.findIndex((c) => c.id === editingCategoryId);
      if (idx >= 0) {
        categories[idx] = payload;
      } else {
        categories.push(payload);
      }
      localStorage.setItem("categories", JSON.stringify(categories));

      // Refresh table based on current search
      const term = searchInput ? searchInput.value : "";
      renderCategoryTable(term);

      // Update KPI cards
      updateCategoryKpis();

      // Close modal and reset form
      closeModalFunc();

      // Show success message
      alert(idx >= 0 ? "Cập nhật danh mục thành công!" : "Thêm danh mục thành công!");
    });
  }

  // Load categories from localStorage on page load
  seedDefaultCategories();
  renderCategoryTable("");
  updateCategoryKpis();
  updateProductNavBadge();
});

function addCategoryToTable(category, index) {
  const tbody = document.querySelector("#categoryTable");
  if (!tbody) return;

  const tr = document.createElement("tr");
  tr.dataset.id = category.id;
  tr.innerHTML = `
    <td>${index}</td>
    <td>
      <div style="display: flex; align-items: center; gap: 10px">
        <span style="font-size: 20px;">${category.icon}</span>
        <span style="font-weight: 500;">${category.name}</span>
      </div>
    </td>
    <td>${category.code || "—"}</td>
    <td>${category.productCount || 0}</td>
    <td>${category.parent || "—"}</td>
    <td><span class="status ${category.status}">${category.statusText}</span></td>
    <td class="cell-right">
      <div class="action-menu">
        <button type="button" class="action-toggle" aria-label="Thao tác">⋯</button>
        <div class="action-dropdown">
          <button class="action-item" data-action="edit">✏️ Chỉnh sửa</button>
          <button class="action-item" data-action="add-child">➕ Thêm danh mục con</button>
          <button class="action-item" data-action="manage-attributes">🏷️ Quản lý thuộc tính</button>
          <button class="action-item danger" data-action="delete">🗑 Xóa danh mục</button>
        </div>
      </div>
    </td>
  `;
  tbody.appendChild(tr);
}

function renderCategoryTable(term) {
  const tbody = document.querySelector("#categoryTable");
  if (!tbody) return;
  const categories = JSON.parse(localStorage.getItem("categories") || "[]");
  const normalized = term ? term.toLowerCase() : "";
  const filtered = normalized
    ? categories.filter(
        (c) =>
          c.name?.toLowerCase().includes(normalized) ||
          c.code?.toLowerCase().includes(normalized)
      )
    : categories;

  tbody.innerHTML = "";
  filtered.forEach((c, idx) => addCategoryToTable(c, idx + 1));
}

function seedDefaultCategories() {
  let categories = JSON.parse(localStorage.getItem("categories") || "[]");
  let changed = false;

  // Ensure ids on existing
  categories = categories.map((c, idx) => {
    if (!c.id) {
      changed = true;
      return { ...c, id: `cat-${idx}-${Date.now()}` };
    }
    return c;
  });

  // Merge default categories if missing (by name or code)
  defaultCategoriesSeed.forEach((def) => {
    const exists = categories.some(
      (c) =>
        (c.code && def.code && c.code.toLowerCase() === def.code.toLowerCase()) ||
        (c.name && def.name && c.name.toLowerCase() === def.name.toLowerCase())
    );
    if (!exists) {
      categories.push(def);
      changed = true;
    }
  });

  if (changed) {
    localStorage.setItem("categories", JSON.stringify(categories));
  }
  
  // Seed default attributes for "Điện thoại" category
  const dienthoaiCategory = categories.find(c => c.id === "dm01" || c.name === "Điện thoại");
  if (dienthoaiCategory) {
    const attributesKey = `category_attributes_${dienthoaiCategory.id}`;
    const existingAttributes = JSON.parse(localStorage.getItem(attributesKey) || "[]");
    if (existingAttributes.length === 0) {
      const defaultAttributes = ["Màu sắc", "Dung lượng", "RAM"];
      localStorage.setItem(attributesKey, JSON.stringify(defaultAttributes));
    }
  }
}

function filterCategories(term) {
  renderCategoryTable(term);
}

// Action handlers
document.addEventListener("click", (e) => {
  const toggle = e.target.closest(".action-toggle");
  const menu = e.target.closest(".action-menu");
  const item = e.target.closest(".action-item");

  // Toggle open
  if (toggle && menu) {
    const isOpen = menu.classList.contains("open");
    document
      .querySelectorAll(".action-menu.open")
      .forEach((m) => m.classList.remove("open"));
    if (!isOpen) menu.classList.add("open");
    return;
  }

  // Action click
  if (item && menu) {
    menu.classList.remove("open");
    const action = item.dataset.action;
    const row = item.closest("tr");
    const id = row?.dataset.id;
    if (!id) return;
    if (action === "edit") {
      openEditCategory(id);
    } else if (action === "add-child") {
      openAddChildCategory(id);
    } else if (action === "manage-attributes") {
      openManageAttributes(id);
    } else if (action === "delete") {
      deleteCategory(id);
    }
    return;
  }

  // Click outside closes
  if (!e.target.closest(".action-menu")) {
    document
      .querySelectorAll(".action-menu.open")
      .forEach((m) => m.classList.remove("open"));
  }
});

function openEditCategory(id) {
  const modal = document.getElementById("categoryModal");
  const modalTitle = modal ? modal.querySelector("h2") : null;
  const categoryForm = document.getElementById("categoryForm");
  if (!modal || !categoryForm) return;

  const categories = JSON.parse(localStorage.getItem("categories") || "[]");
  const cat = categories.find((c) => c.id === id);
  if (!cat) return;

  editingCategoryId = id;
  setCategoryFormMode(modalTitle, categoryForm, "edit");
  fillCategoryForm(cat);
  modal.style.display = "flex";
}

function openAddChildCategory(id) {
  const modal = document.getElementById("categoryModal");
  const modalTitle = modal ? modal.querySelector("h2") : null;
  const categoryForm = document.getElementById("categoryForm");
  if (!modal || !categoryForm) return;

  const categories = JSON.parse(localStorage.getItem("categories") || "[]");
  const cat = categories.find((c) => c.id === id);
  if (!cat) return;

  editingCategoryId = null;
  setCategoryFormMode(modalTitle, categoryForm, "add");
  categoryForm.reset();
  if (categoryForm.elements["parentCategory"]) {
    categoryForm.elements["parentCategory"].value = cat.name;
  }
  modal.style.display = "flex";
}

function deleteCategory(id) {
  if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;
  const categories = JSON.parse(localStorage.getItem("categories") || "[]").filter((c) => c.id !== id);
  localStorage.setItem("categories", JSON.stringify(categories));
  const searchInput = document.getElementById("categorySearch");
  renderCategoryTable(searchInput ? searchInput.value : "");
  updateCategoryKpis();
  updateProductNavBadge();
}

function setCategoryFormMode(titleEl, form, mode) {
  if (!titleEl || !form) return;
  if (mode === "edit") {
    titleEl.textContent = "Chỉnh sửa danh mục";
    const submitBtn = form.querySelector(".btn-submit");
    if (submitBtn) submitBtn.textContent = "Lưu thay đổi";
  } else {
    titleEl.textContent = "Thêm danh mục mới";
    const submitBtn = form.querySelector(".btn-submit");
    if (submitBtn) submitBtn.textContent = "Thêm danh mục";
  }
}

function fillCategoryForm(cat) {
  const categoryForm = document.getElementById("categoryForm");
  if (!categoryForm) return;
  categoryForm.elements["categoryName"].value = cat.name || "";
  categoryForm.elements["categoryCode"].value = cat.code || "";
  categoryForm.elements["icon"].value = cat.icon || "";
  if (categoryForm.elements["parentCategory"]) {
    categoryForm.elements["parentCategory"].value = cat.parent || "";
  }
  categoryForm.elements["description"].value = cat.description || "";
}

// Update product badge in sidebar (reuse logic across pages)
function updateProductNavBadge() {
  const badge =
    document.querySelector(".nav-item[href='sanpham-full.html'] .nav-badge.gray") ||
    document.querySelector(".nav-item.active[href='sanpham-full.html'] .nav-badge.gray");
  if (!badge) return;
  const count = JSON.parse(localStorage.getItem("products") || "[]").length;
  badge.textContent = count;
}

// KPI update functions
function updateCategoryKpis() {
  const categories = JSON.parse(localStorage.getItem("categories") || "[]");
  const products = JSON.parse(localStorage.getItem("products") || "[]");

  const totalCategoriesEl = document.getElementById("kpiTotalCategories");
  const totalProductsEl = document.getElementById("kpiTotalProducts");
  const largestCountEl = document.getElementById("kpiLargestCount");
  const largestNameEl = document.getElementById("kpiLargestName");

  if (totalCategoriesEl) totalCategoriesEl.textContent = categories.length;
  if (totalProductsEl) totalProductsEl.textContent = products.length;

  // Tính danh mục lớn nhất dựa trên số sản phẩm
  const counts = {};
  products.forEach((p) => {
    const key = (p.category || "Khác").trim();
    counts[key] = (counts[key] || 0) + 1;
  });

  let largestName = "—";
  let largestCount = 0;
  Object.entries(counts).forEach(([name, count]) => {
    if (count > largestCount) {
      largestCount = count;
      largestName = name;
    }
  });

  if (largestCountEl) largestCountEl.textContent = largestCount;
  if (largestNameEl) largestNameEl.textContent = largestName;
}

// Attributes Management Functions
let currentCategoryIdForAttributes = null;
let editingAttributeIndex = null;

// Helper functions to update products when attributes change
function addAttributeToCategoryProducts(categoryName, attributeName) {
  let products = JSON.parse(localStorage.getItem("products") || "[]");
  let updatedCount = 0;
  
  products = products.map(product => {
    // Check if product belongs to this category
    if (product.category === categoryName) {
      // Initialize attributes object if it doesn't exist
      if (!product.attributes) {
        product.attributes = {};
      }
      // Add new attribute with empty value if it doesn't exist
      if (!product.attributes.hasOwnProperty(attributeName)) {
        product.attributes[attributeName] = "";
        updatedCount++;
      }
    }
    return product;
  });
  
  if (updatedCount > 0) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  
  return updatedCount;
}

function updateProductsAttributeName(categoryName, oldAttributeName, newAttributeName) {
  let products = JSON.parse(localStorage.getItem("products") || "[]");
  let updatedCount = 0;
  
  products = products.map(product => {
    // Check if product belongs to this category and has the old attribute
    if (product.category === categoryName && product.attributes && product.attributes.hasOwnProperty(oldAttributeName)) {
      // Rename the attribute key
      const value = product.attributes[oldAttributeName];
      delete product.attributes[oldAttributeName];
      product.attributes[newAttributeName] = value;
      updatedCount++;
    }
    return product;
  });
  
  if (updatedCount > 0) {
    localStorage.setItem("products", JSON.stringify(products));
    console.log(`Đã đổi tên thuộc tính trong ${updatedCount} sản phẩm: "${oldAttributeName}" → "${newAttributeName}"`);
  }
  
  return updatedCount;
}

function removeAttributeFromCategoryProducts(categoryName, attributeName) {
  let products = JSON.parse(localStorage.getItem("products") || "[]");
  let updatedCount = 0;
  
  products = products.map(product => {
    // Check if product belongs to this category and has this attribute
    if (product.category === categoryName && product.attributes && product.attributes.hasOwnProperty(attributeName)) {
      delete product.attributes[attributeName];
      updatedCount++;
    }
    return product;
  });
  
  if (updatedCount > 0) {
    localStorage.setItem("products", JSON.stringify(products));
    console.log(`Đã xóa thuộc tính "${attributeName}" khỏi ${updatedCount} sản phẩm`);
  }
  
  return updatedCount;
}

function openManageAttributes(categoryId) {
  currentCategoryIdForAttributes = categoryId;
  editingAttributeIndex = null;
  
  const modal = document.getElementById("attributesModal");
  const modalTitle = document.getElementById("attributesModalTitle");
  const categories = JSON.parse(localStorage.getItem("categories") || "[]");
  const category = categories.find((c) => c.id === categoryId);
  
  if (!modal || !category) return;
  
  // Set modal title
  if (modalTitle) {
    modalTitle.textContent = `Quản lý thuộc tính - ${category.name}`;
  }
  
  // Load and render attributes
  renderAttributesList();
  
  // Clear input
  const newAttributeInput = document.getElementById("newAttributeInput");
  if (newAttributeInput) {
    newAttributeInput.value = "";
    newAttributeInput.placeholder = "Tên thuộc tính mới...";
  }
  
  // Show modal
  modal.style.display = "flex";
  
  // Setup event listeners
  setupAttributesModalListeners();
}

function setupAttributesModalListeners() {
  const modal = document.getElementById("attributesModal");
  const closeBtn = document.getElementById("closeAttributesModal");
  const closeBtnFooter = document.getElementById("closeAttributesModalBtn");
  const addBtn = document.getElementById("addAttributeBtn");
  const newAttributeInput = document.getElementById("newAttributeInput");
  
  // Close modal functions
  const closeModal = () => {
    if (modal) modal.style.display = "none";
    currentCategoryIdForAttributes = null;
    editingAttributeIndex = null;
  };
  
  if (closeBtn) {
    closeBtn.onclick = closeModal;
  }
  
  if (closeBtnFooter) {
    closeBtnFooter.onclick = closeModal;
  }
  
  // Close when clicking outside
  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };
  }
  
  // Add/Edit attribute
  const handleAddAttribute = () => {
    if (!newAttributeInput || !currentCategoryIdForAttributes) return;
    
    const attributeName = newAttributeInput.value.trim();
    if (!attributeName) {
      alert("Vui lòng nhập tên thuộc tính!");
      return;
    }
    
    // Get category info
    const categories = JSON.parse(localStorage.getItem("categories") || "[]");
    const category = categories.find((c) => c.id === currentCategoryIdForAttributes);
    if (!category) return;
    
    // Get attributes from localStorage
    const attributesKey = `category_attributes_${currentCategoryIdForAttributes}`;
    let attributes = JSON.parse(localStorage.getItem(attributesKey) || "[]");
    
    if (editingAttributeIndex !== null) {
      // Edit existing attribute - rename attribute in all products
      const oldAttributeName = attributes[editingAttributeIndex];
      attributes[editingAttributeIndex] = attributeName;
      
      // Update all products in this category
      const updatedCount = updateProductsAttributeName(category.name, oldAttributeName, attributeName);
      
      editingAttributeIndex = null;
      if (newAttributeInput) {
        newAttributeInput.value = "";
        newAttributeInput.placeholder = "Tên thuộc tính mới...";
      }
      if (addBtn) addBtn.textContent = "+ Thêm";
    } else {
      // Check if attribute already exists
      if (attributes.includes(attributeName)) {
        alert("Thuộc tính này đã tồn tại!");
        return;
      }
      // Add new attribute
      attributes.push(attributeName);
      
      // Add this attribute to all products in this category
      const updatedCount = addAttributeToCategoryProducts(category.name, attributeName);
      if (updatedCount > 0) {
        // Show notification (optional, can be removed if too verbose)
        console.log(`Đã cập nhật ${updatedCount} sản phẩm với thuộc tính mới: ${attributeName}`);
      }
    }
    
    // Save to localStorage
    localStorage.setItem(attributesKey, JSON.stringify(attributes));
    
    // Clear input and re-render
    if (newAttributeInput) {
      newAttributeInput.value = "";
      newAttributeInput.placeholder = "Tên thuộc tính mới...";
    }
    renderAttributesList();
  };
  
  if (addBtn) {
    addBtn.onclick = handleAddAttribute;
  }
  
  // Allow Enter key to add
  if (newAttributeInput) {
    newAttributeInput.onkeypress = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddAttribute();
      }
    };
  }
}

function renderAttributesList() {
  if (!currentCategoryIdForAttributes) return;
  
  const attributesList = document.getElementById("attributesList");
  if (!attributesList) return;
  
  // Get attributes from localStorage
  const attributesKey = `category_attributes_${currentCategoryIdForAttributes}`;
  const attributes = JSON.parse(localStorage.getItem(attributesKey) || "[]");
  
  if (attributes.length === 0) {
    attributesList.innerHTML = '<div style="color: var(--text-muted); padding: 20px; text-align: center;">Chưa có thuộc tính nào</div>';
    return;
  }
  
  attributesList.innerHTML = attributes.map((attr, index) => `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: var(--bg-elevated-2); border: 1px solid var(--border); border-radius: 8px; transition: background 0.2s;" 
         onmouseover="this.style.background='var(--bg-elevated)'" 
         onmouseout="this.style.background='var(--bg-elevated-2)'">
      <span style="color: var(--text); font-size: 14px;">${attr}</span>
      <div style="display: flex; gap: 8px;">
        <button type="button" 
                onclick="editAttribute(${index})" 
                style="background: transparent; border: none; color: var(--text); cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: background 0.2s;"
                onmouseover="this.style.background='rgba(255,255,255,0.1)'"
                onmouseout="this.style.background='transparent'"
                title="Chỉnh sửa">
          ✏️
        </button>
        <button type="button" 
                onclick="deleteAttribute(${index})" 
                style="background: transparent; border: none; color: var(--danger); cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: background 0.2s;"
                onmouseover="this.style.background='rgba(249,115,115,0.1)'"
                onmouseout="this.style.background='transparent'"
                title="Xóa">
          🗑️
        </button>
      </div>
    </div>
  `).join("");
}

// Global functions for inline onclick handlers
window.editAttribute = function(index) {
  if (!currentCategoryIdForAttributes) return;
  
  const attributesKey = `category_attributes_${currentCategoryIdForAttributes}`;
  const attributes = JSON.parse(localStorage.getItem(attributesKey) || "[]");
  
  if (index >= 0 && index < attributes.length) {
    editingAttributeIndex = index;
    const newAttributeInput = document.getElementById("newAttributeInput");
    const addBtn = document.getElementById("addAttributeBtn");
    
    if (newAttributeInput) {
      newAttributeInput.value = attributes[index];
      newAttributeInput.focus();
    }
    if (addBtn) {
      addBtn.textContent = "💾 Lưu";
    }
  }
};

window.deleteAttribute = function(index) {
  if (!currentCategoryIdForAttributes) return;
  
  if (!confirm("Bạn có chắc muốn xóa thuộc tính này? Thuộc tính này sẽ bị xóa khỏi tất cả sản phẩm trong danh mục.")) return;
  
  // Get category info
  const categories = JSON.parse(localStorage.getItem("categories") || "[]");
  const category = categories.find((c) => c.id === currentCategoryIdForAttributes);
  if (!category) return;
  
  const attributesKey = `category_attributes_${currentCategoryIdForAttributes}`;
  let attributes = JSON.parse(localStorage.getItem(attributesKey) || "[]");
  
  const attributeNameToDelete = attributes[index];
  attributes.splice(index, 1);
  localStorage.setItem(attributesKey, JSON.stringify(attributes));
  
  // Remove this attribute from all products in this category
  const updatedCount = removeAttributeFromCategoryProducts(category.name, attributeNameToDelete);
  
  // Reset editing state if needed
  if (editingAttributeIndex === index) {
    editingAttributeIndex = null;
    const newAttributeInput = document.getElementById("newAttributeInput");
    const addBtn = document.getElementById("addAttributeBtn");
    if (newAttributeInput) {
      newAttributeInput.value = "";
      newAttributeInput.placeholder = "Tên thuộc tính mới...";
    }
    if (addBtn) addBtn.textContent = "+ Thêm";
  }
  
  renderAttributesList();
};
