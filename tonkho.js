// ===== DỮ LIỆU TỒN KHO MẪU =====
const inventorySeed = [
  {
    id: "p1",
    name: "iPhone 15 Pro Max",
    category: "Điện thoại",
    image: "./img/iphone15.jpg",
    variants: [
      {
        id: "v1",
        name: "256GB – Đen",
        sku: "IP15PM-256-BK",
        stock: 15,
        reserved: 2,
      },
      {
        id: "v2",
        name: "256GB – Trắng",
        sku: "IP15PM-256-WH",
        stock: 8,
        reserved: 1,
      },
      {
        id: "v3",
        name: "512GB – Đen",
        sku: "IP15PM-512-BK",
        stock: 5,
        reserved: 0,
      },
      {
        id: "v4",
        name: "512GB – Trắng",
        sku: "IP15PM-512-WH",
        stock: 0,
        reserved: 1,
      },
    ],
  },
  {
    id: "p2",
    name: "MacBook Air M3",
    category: "Laptop",
    image: "./img/macbookair.jpg",
    variants: [
      {
        id: "v1",
        name: "8GB – 256GB",
        sku: "MBA-M3-8-256",
        stock: 10,
        reserved: 2,
      },
      {
        id: "v2",
        name: "16GB – 512GB",
        sku: "MBA-M3-16-512",
        stock: 4,
        reserved: 1,
      },
    ],
  },
  {
    id: "p3",
    name: "AirPods Pro 2",
    category: "Phụ kiện",
    image: "./img/airpodspro2.jpg",
    variants: [
      { id: "v1", name: "Bản thường", sku: "APP2-STD", stock: 12, reserved: 0 },
    ],
  },
];

const INVENTORY_STORAGE_KEY = "inventoryData_v1";

let inventoryData = [];
let currentStockContext = null; // { productId, variantId }

document.addEventListener("DOMContentLoaded", () => {
  const inventoryTable = document.getElementById("inventoryTable");
  if (!inventoryTable) return; // không phải trang tồn kho

  // Load data từ localStorage hoặc seed mặc định
  const stored = localStorage.getItem(INVENTORY_STORAGE_KEY);
  if (stored) {
    try {
      inventoryData = JSON.parse(stored);
    } catch {
      inventoryData = inventorySeed;
    }
  } else {
    inventoryData = inventorySeed;
  }

  renderInventoryTable();
  updateInventoryKpis();
  setupRowToggle();
  setupStockModalLogic();
  setupActionMenuHandler();
});

// ===== Render bảng tồn kho =====
function renderInventoryTable() {
  const tbody = document.getElementById("inventoryTable");
  if (!tbody) return;
  tbody.innerHTML = "";

  inventoryData.forEach((product) => {
    const totals = calcProductTotals(product);

    // Row sản phẩm cha
    const parentTr = document.createElement("tr");
    parentTr.className = "product-parent";
    parentTr.dataset.productId = product.id;
    parentTr.innerHTML = `
      <td style="text-align:center">
        <input type="checkbox" class="inventory-checkbox" />
      </td>
      <td>
        <div style="display:flex;align-items:center">
          <img src="${
            product.image
          }" alt="" class="product-img" onerror="this.style.display='none'" />
          <div class="product-info">
            <span class="product-name">${product.name}</span>
            <span class="variant-count">${
              product.variants.length
            } biến thể</span>
          </div>
        </div>
      </td>
      <td>—</td>
      <td>${product.category || "—"}</td>
      <td><b>${totals.totalStock}</b></td>
      <td>${totals.totalReserved}</td>
      <td style="color:#22c55e">${totals.totalSellable}</td>
      <td>${renderStatusBadge(
        totals.totalStock,
        totals.lowStockCount,
        totals.outStockCount
      )}</td>
      <td class="cell-right">
        <div class="action-menu">
          <button type="button" class="action-toggle" aria-label="Thao tác">⋯</button>
          <div class="action-dropdown">
            <button class="action-item" data-action="import" data-product-id="${product.id}">➕ Nhập kho</button>
            <button class="action-item" data-action="adjust" data-product-id="${product.id}">✏️ Điều chỉnh</button>
          </div>
        </div>
      </td>
    `;
    tbody.appendChild(parentTr);

    // Các biến thể
    product.variants.forEach((v) => {
      const sellable = v.stock - v.reserved;
      const statusBadge = renderStatusBadge(
        v.stock,
        v.stock <= 5 && v.stock > 0 ? 1 : 0,
        v.stock <= 0 ? 1 : 0
      );

      const tr = document.createElement("tr");
      tr.className = "variant-row";
      tr.dataset.productId = product.id;
      tr.dataset.variantId = v.id;

      tr.innerHTML = `
        <td></td>
        <td class="child-indent">${v.name}</td>
        <td class="sku-text">${v.sku}</td>
        <td>${product.category || "—"}</td>
        <td class="stock-cell" data-product-id="${
          product.id
        }" data-variant-id="${v.id}">
          ${v.stock}
        </td>
        <td>${v.reserved}</td>
        <td>${sellable}</td>
        <td>${statusBadge}</td>
        <td class="cell-right">
          <button 
            type="button" 
            class="action-btn-edit" 
            onclick="handleAdjustStock('${product.id}', '${v.id}')"
            title="Điều chỉnh tồn kho"
            style="padding: 6px 10px; background: transparent; border: 1px solid var(--border-color, #374151); border-radius: 4px; cursor: pointer; color: var(--text, #fff); font-size: 16px;"
          >
            ✎
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  });
}

// Tính tổng cho 1 sản phẩm
function calcProductTotals(product) {
  let totalStock = 0;
  let totalReserved = 0;
  let totalSellable = 0;
  let lowStockCount = 0;
  let outStockCount = 0;

  product.variants.forEach((v) => {
    totalStock += v.stock;
    totalReserved += v.reserved;
    totalSellable += v.stock - v.reserved;
    if (v.stock <= 0) outStockCount++;
    else if (v.stock <= 5) lowStockCount++;
  });

  return {
    totalStock,
    totalReserved,
    totalSellable,
    lowStockCount,
    outStockCount,
  };
}

// Render badge trạng thái
function renderStatusBadge(stock, lowCount, outCount) {
  if (stock <= 0 || outCount > 0) {
    return `<span class="status-badge status-red">Hết hàng</span>`;
  }
  if (lowCount > 0) {
    return `<span class="status-badge status-yellow">Sắp hết</span>`;
  }
  return `<span class="status-badge status-green">Còn hàng</span>`;
}

// ===== KPI =====
function updateInventoryKpis() {
  let totalStock = 0;
  let totalVariants = 0;
  let lowStock = 0;
  let outStock = 0;

  inventoryData.forEach((p) => {
    p.variants.forEach((v) => {
      totalStock += v.stock;
      totalVariants++;
      if (v.stock <= 0) outStock++;
      else if (v.stock <= 5) lowStock++;
    });
  });

  const totalStockEl = document.getElementById("kpiTotalStock");
  const totalVarEl = document.getElementById("kpiTotalVariants");
  const lowEl = document.getElementById("kpiLowStock");
  const outEl = document.getElementById("kpiOutOfStock");

  if (totalStockEl) totalStockEl.textContent = totalStock;
  if (totalVarEl) totalVarEl.textContent = totalVariants;
  if (lowEl) lowEl.textContent = lowStock;
  if (outEl) outEl.textContent = outStock;
}

// ===== Toggle mở/đóng biến thể khi click sản phẩm cha =====
let rowToggleHandler = null;

function setupRowToggle() {
  // Xóa event listener cũ nếu có
  if (rowToggleHandler) {
    document.removeEventListener("click", rowToggleHandler);
  }
  
  // Tạo handler mới
  rowToggleHandler = (e) => {
    const parentRow = e.target.closest(".product-parent");
    if (!parentRow) return;

    // Đừng toggle nếu click vào checkbox, action-menu, action-toggle, hoặc action-btn-edit
    if (
      e.target.tagName === "INPUT" ||
      e.target.closest(".action-menu") ||
      e.target.closest(".action-toggle") ||
      e.target.classList.contains("action-btn") ||
      e.target.classList.contains("action-btn-edit")
    ) {
      return;
    }

    const productId = parentRow.dataset.productId;
    if (!productId) return;

    let nextRow = parentRow.nextElementSibling;
    while (nextRow && !nextRow.classList.contains("product-parent")) {
      if (nextRow.dataset.productId === productId) {
        nextRow.style.display =
          nextRow.style.display === "none" ? "table-row" : "none";
      }
      nextRow = nextRow.nextElementSibling;
    }
  };
  
  // Thêm event listener mới
  document.addEventListener("click", rowToggleHandler);

  // Mặc định ẩn tất cả biến thể
  const variantRows = document.querySelectorAll(".variant-row");
  variantRows.forEach((row) => {
    row.style.display = "none";
  });
}

// ===== Logic modal tồn kho =====
function setupStockModalLogic() {
  const stockModal = document.getElementById("stockModal");
  if (!stockModal) return;

  const stockProductNameEl = document.getElementById("stockProductName");
  const stockCurrentDisplay = document.getElementById("stockCurrentDisplay");
  const stockNewDisplay = document.getElementById("stockNewDisplay");
  const stockNewValue = document.getElementById("stockNewValue");
  const stockAdjustType = document.getElementById("stockAdjustType");
  const stockChangeInput = document.getElementById("stockChange");
  const stockNoteInput = document.getElementById("stockNote");
  const saveBtn = document.getElementById("btnSaveStock");
  const closeBtns = document.querySelectorAll(".stock-close");
  
  // Hàm tính toán và hiển thị tồn kho mới
  const updateStockPreview = () => {
    if (!currentStockContext) return;
    const { productId, variantId } = currentStockContext;
    const { product, variant } = findVariant(productId, variantId);
    if (!product || !variant) return;
    
    const currentStock = variant.stock;
    const adjustType = stockAdjustType ? stockAdjustType.value : "add";
    const changeAmount = parseInt(stockChangeInput.value || "0", 10);
    
    if (isNaN(changeAmount) || changeAmount <= 0) {
      if (stockNewDisplay) stockNewDisplay.style.display = "none";
      return;
    }
    
    let newStock = currentStock;
    if (adjustType === "add") {
      newStock = currentStock + changeAmount;
    } else if (adjustType === "subtract") {
      newStock = Math.max(0, currentStock - changeAmount);
    } else if (adjustType === "set") {
      newStock = changeAmount;
    }
    
    if (stockNewValue) stockNewValue.textContent = newStock;
    if (stockNewDisplay) stockNewDisplay.style.display = "block";
  };
  
  // Cập nhật preview khi thay đổi loại điều chỉnh hoặc số lượng
  if (stockAdjustType) {
    stockAdjustType.addEventListener("change", updateStockPreview);
  }
  if (stockChangeInput) {
    stockChangeInput.addEventListener("input", updateStockPreview);
  }

  // Click vào ô Tồn kho
  document.addEventListener("click", (e) => {
    const cell = e.target.closest(".stock-cell");
    if (!cell) return;

    const productId = cell.dataset.productId;
    const variantId = cell.dataset.variantId;
    if (!productId || !variantId) return;

    const { product, variant } = findVariant(productId, variantId);
    if (!product || !variant) return;

    currentStockContext = { productId, variantId };

    const productName = `${product.name} – ${variant.name}`;
    if (stockProductNameEl) stockProductNameEl.textContent = productName;
    if (stockCurrentDisplay) stockCurrentDisplay.textContent = variant.stock;
    if (stockChangeInput) stockChangeInput.value = "";
    if (stockAdjustType) stockAdjustType.value = "add";
    if (stockNoteInput) stockNoteInput.value = "";

    stockModal.style.display = "flex";
  });

  // Lưu tồn kho
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      if (!currentStockContext) return;
      const { productId, variantId } = currentStockContext;
      
      const adjustType = stockAdjustType ? stockAdjustType.value : "add";
      const changeAmount = parseInt(stockChangeInput.value || "0", 10);
      const note = stockNoteInput ? stockNoteInput.value.trim() : "";

      if (isNaN(changeAmount) || changeAmount <= 0) {
        alert("Vui lòng nhập số lượng hợp lệ!");
        return;
      }

      const { product, variant } = findVariant(productId, variantId);
      if (!product || !variant) return;

      // Tính tồn kho mới dựa trên loại điều chỉnh
      let newStock = variant.stock;
      if (adjustType === "add") {
        newStock = variant.stock + changeAmount;
      } else if (adjustType === "subtract") {
        newStock = Math.max(0, variant.stock - changeAmount);
      } else if (adjustType === "set") {
        newStock = changeAmount;
      }

      variant.stock = newStock;

      // Lưu lại localStorage
      localStorage.setItem(
        INVENTORY_STORAGE_KEY,
        JSON.stringify(inventoryData)
      );

      // Render lại bảng & KPI
      renderInventoryTable();
      updateInventoryKpis();
      setupRowToggle(); // ẩn lại biến thể sau khi render
      setupActionMenuHandler(); // Setup lại menu handler

      stockModal.style.display = "none";
      currentStockContext = null;
      
      alert(`Đã cập nhật tồn kho thành công!${note ? '\nGhi chú: ' + note : ''}`);
    });
  }

  // Đóng modal
  const closeModal = () => {
    stockModal.style.display = "none";
    currentStockContext = null;
  };

  closeBtns.forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });

  window.addEventListener("click", (e) => {
    if (e.target === stockModal) {
      closeModal();
    }
  });
}

// Tìm variant trong data
function findVariant(productId, variantId) {
  const product = inventoryData.find((p) => p.id === productId);
  if (!product) return { product: null, variant: null };
  const variant = product.variants.find((v) => v.id === variantId);
  return { product, variant };
}

// ===== Xử lý menu action (nút 3 chấm) =====
let actionMenuHandler = null;

function setupActionMenuHandler() {
  // Xóa event listener cũ nếu có để tránh duplicate
  if (actionMenuHandler) {
    document.removeEventListener("click", actionMenuHandler);
  }
  
  // Tạo handler mới
  actionMenuHandler = (e) => {
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
      const productId = item.getAttribute("data-product-id");
      const variantId = item.getAttribute("data-variant-id");
      
      console.log("Action clicked:", action, "Product ID:", productId, "Variant ID:", variantId);
      
      if (action === "import") {
        handleImportStock(productId, variantId);
      } else if (action === "adjust") {
        handleAdjustStock(productId, variantId);
      }
      return;
    }

    // Click outside -> close all menus
    if (!e.target.closest(".action-menu")) {
      document
        .querySelectorAll(".action-menu.open")
        .forEach((m) => m.classList.remove("open"));
    }
  };
  
  // Thêm event listener mới
  document.addEventListener("click", actionMenuHandler);
}

// Xử lý nhập kho
function handleImportStock(productId, variantId) {
  if (variantId) {
    // Nhập kho cho biến thể cụ thể
    const { product, variant } = findVariant(productId, variantId);
    if (!product || !variant) return;
    
    const amount = prompt(`Nhập số lượng muốn thêm vào kho cho "${variant.name}":`, "0");
    if (amount === null) return; // User cancelled
    
    const addAmount = parseInt(amount, 10);
    if (isNaN(addAmount) || addAmount <= 0) {
      alert("Vui lòng nhập số lượng hợp lệ!");
      return;
    }
    
    variant.stock += addAmount;
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventoryData));
    renderInventoryTable();
    updateInventoryKpis();
    setupRowToggle();
    alert(`Đã nhập ${addAmount} sản phẩm vào kho!`);
  } else {
    // Nhập kho cho toàn bộ sản phẩm
    const product = inventoryData.find((p) => p.id === productId);
    if (!product) return;
    
    const amount = prompt(`Nhập số lượng muốn thêm vào kho cho tất cả biến thể của "${product.name}":`, "0");
    if (amount === null) return;
    
    const addAmount = parseInt(amount, 10);
    if (isNaN(addAmount) || addAmount <= 0) {
      alert("Vui lòng nhập số lượng hợp lệ!");
      return;
    }
    
    product.variants.forEach((v) => {
      v.stock += addAmount;
    });
    
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventoryData));
    renderInventoryTable();
    updateInventoryKpis();
    setupRowToggle();
    setupActionMenuHandler(); // Setup lại menu handler
    alert(`Đã nhập ${addAmount} sản phẩm vào kho cho tất cả biến thể!`);
  }
}

// Xử lý điều chỉnh tồn kho
function handleAdjustStock(productId, variantId) {
  if (variantId) {
    // Điều chỉnh cho biến thể cụ thể
    const { product, variant } = findVariant(productId, variantId);
    if (!product || !variant) return;
    
    currentStockContext = { productId, variantId };
    
    const stockModal = document.getElementById("stockModal");
    const stockProductNameEl = document.getElementById("stockProductName");
    const stockCurrentDisplay = document.getElementById("stockCurrentDisplay");
    const stockAdjustType = document.getElementById("stockAdjustType");
    const stockChangeInput = document.getElementById("stockChange");
    const stockNoteInput = document.getElementById("stockNote");
    
    if (stockModal && stockProductNameEl && stockCurrentDisplay) {
      const productName = `${product.name} – ${variant.name}`;
      stockProductNameEl.textContent = productName;
      stockCurrentDisplay.textContent = variant.stock;
      if (stockChangeInput) stockChangeInput.value = "";
      if (stockAdjustType) stockAdjustType.value = "add";
      if (stockNoteInput) stockNoteInput.value = "";
      if (stockNewDisplay) stockNewDisplay.style.display = "none";
      stockModal.style.display = "flex";
    }
  } else {
    // Điều chỉnh cho toàn bộ sản phẩm - hiển thị thông báo
    alert("Vui lòng chọn biến thể cụ thể để điều chỉnh tồn kho.");
  }
}
