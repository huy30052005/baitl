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
  const searchInput = document.getElementById("categorySearch");
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

  // Search
  if (searchInput) {
    searchInput.addEventListener("input", () => filterCategories(searchInput.value));
  }
  if (clearSearchBtn && searchInput) {
    clearSearchBtn.addEventListener("click", () => {
      searchInput.value = "";
      filterCategories("");
      searchInput.focus();
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
