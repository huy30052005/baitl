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
      <td><button class="action-btn" type="button">⋮</button></td>
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
        <td><button class="action-btn" type="button">✎</button></td>
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
function setupRowToggle() {
  document.addEventListener("click", (e) => {
    const parentRow = e.target.closest(".product-parent");
    if (!parentRow) return;

    // Đừng toggle nếu click vào checkbox hoặc action-btn
    if (
      e.target.tagName === "INPUT" ||
      e.target.classList.contains("action-btn")
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
  });

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
  const stockSkuEl = document.getElementById("stockSku");
  const stockCurrentInput = document.getElementById("stockCurrent");
  const stockChangeInput = document.getElementById("stockChange");
  const stockNewInput = document.getElementById("stockNew");
  const saveBtn = document.getElementById("btnSaveStock");
  const closeBtns = document.querySelectorAll(".stock-close");

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
    stockProductNameEl.textContent = productName;
    stockSkuEl.textContent = variant.sku;
    stockCurrentInput.value = variant.stock;
    stockChangeInput.value = "";
    stockNewInput.value = variant.stock;

    stockModal.style.display = "flex";
  });

  // Tự tính tồn kho mới khi nhập điều chỉnh
  if (stockChangeInput) {
    stockChangeInput.addEventListener("input", () => {
      const current = parseInt(stockCurrentInput.value || "0", 10);
      const delta = parseInt(stockChangeInput.value || "0", 10);
      const newVal = current + (isNaN(delta) ? 0 : delta);
      stockNewInput.value = newVal;
    });
  }

  // Lưu tồn kho
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      if (!currentStockContext) return;
      const { productId, variantId } = currentStockContext;
      const newStock = parseInt(stockNewInput.value || "0", 10);

      const { product, variant } = findVariant(productId, variantId);
      if (!product || !variant) return;

      variant.stock = isNaN(newStock) ? variant.stock : newStock;

      // Lưu lại localStorage
      localStorage.setItem(
        INVENTORY_STORAGE_KEY,
        JSON.stringify(inventoryData)
      );

      // Render lại bảng & KPI
      renderInventoryTable();
      updateInventoryKpis();
      setupRowToggle(); // ẩn lại biến thể sau khi render

      stockModal.style.display = "none";
      currentStockContext = null;
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
