// ======================= DATA MẪU ĐƠN HÀNG =======================
const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPING: "shipping",
  COMPLETED: "completed",
  CANCELED: "canceled",
};

const ordersSeed = [
  {
    id: "1",
    code: "#DH-12345",
    customerName: "Trần Văn A",
    phone: "0912 345 678",
    avatar: "", // để trống dùng chữ cái đầu
    items: 1,
    total: 34990000,
    paymentMethod: "COD",
    paymentStatus: "Chưa thanh toán",
    status: ORDER_STATUS.PENDING,
    createdAt: "2025-01-15T14:30:00",
  },
  {
    id: "2",
    code: "#DH-12344",
    customerName: "Nguyễn Thị B",
    phone: "0367 654 321",
    avatar: "",
    items: 2,
    total: 34480000,
    paymentMethod: "Banking",
    paymentStatus: "Đã thanh toán",
    status: ORDER_STATUS.PROCESSING,
    createdAt: "2025-01-15T12:15:00",
  },
  {
    id: "3",
    code: "#DH-12343",
    customerName: "Lê Hoàng C",
    phone: "0909 123 456",
    avatar: "",
    items: 1,
    total: 12980000,
    paymentMethod: "Momo",
    paymentStatus: "Đã thanh toán",
    status: ORDER_STATUS.SHIPPING,
    createdAt: "2025-01-14T18:45:00",
  },
  {
    id: "4",
    code: "#DH-12342",
    customerName: "Phạm Minh D",
    phone: "0978 111 222",
    avatar: "",
    items: 1,
    total: 31990000,
    paymentMethod: "Credit Card",
    paymentStatus: "Đã thanh toán",
    status: ORDER_STATUS.COMPLETED,
    createdAt: "2025-01-14T10:20:00",
  },
  {
    id: "5",
    code: "#DH-12341",
    customerName: "Võ Thị E",
    phone: "0935 999 888",
    avatar: "",
    items: 1,
    total: 21990000,
    paymentMethod: "Banking",
    paymentStatus: "Đã hoàn tiền",
    status: ORDER_STATUS.CANCELED,
    createdAt: "2025-01-13T09:00:00",
  },
];

const ORDER_STORAGE_KEY = "sellerhub_orders_v1";

let orders = [];
let currentStatusFilter = "all";
let currentDateFilter = "today";

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("orderTable");
  if (!tableBody) return; // Không phải trang đơn hàng

  // Load data từ localStorage hoặc seed
  const stored = localStorage.getItem(ORDER_STORAGE_KEY);
  if (stored) {
    try {
      orders = JSON.parse(stored);
    } catch {
      orders = ordersSeed;
    }
  } else {
    orders = ordersSeed;
  }

  // Element
  const searchInput = document.getElementById("orderSearch");
  const tabButtons = document.querySelectorAll(".order-tab");
  const dateFilter = document.querySelector(".date-filter");
  const dateTrigger = document.getElementById("dateTrigger");
  const dateLabel = document.getElementById("dateLabel");
  const dateOptions = document.querySelectorAll(".date-option");
  const checkAll = document.getElementById("checkAllOrders");

  // Render lần đầu
  renderOrders();
  updateKpis();
  updateTabCounts();
  updateOrderNavBadge();

  // Tìm kiếm
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderOrders();
    });
  }

  // Tabs trạng thái
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentStatusFilter = btn.dataset.status || "all";
      renderOrders();
    });
  });

  // Date dropdown
  if (dateTrigger) {
    dateTrigger.addEventListener("click", () => {
      dateFilter.classList.toggle("open");
    });
  }

  dateOptions.forEach((opt) => {
    opt.addEventListener("click", () => {
      const range = opt.dataset.range || "today";
      currentDateFilter = range;
      if (dateLabel) dateLabel.textContent = opt.textContent.trim();
      dateFilter.classList.remove("open");
      renderOrders();
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".date-filter")) {
      dateFilter.classList.remove("open");
    }
  });

  // Check all
  if (checkAll) {
    checkAll.addEventListener("change", () => {
      document
        .querySelectorAll(".order-row-checkbox")
        .forEach((cb) => (cb.checked = checkAll.checked));
    });
  }
});

// ================== RENDER ==================
function renderOrders() {
  const tbody = document.getElementById("orderTable");
  if (!tbody) return;

  const searchTerm = (
    document.getElementById("orderSearch")?.value || ""
  ).toLowerCase();

  tbody.innerHTML = "";

  const filtered = orders.filter((o) => {
    // Status filter
    if (currentStatusFilter !== "all" && o.status !== currentStatusFilter) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const text = (
        o.code +
        " " +
        o.customerName +
        " " +
        (o.phone || "")
      ).toLowerCase();
      if (!text.includes(searchTerm)) return false;
    }

    // Date filter
    if (!matchDateFilter(o, currentDateFilter)) return false;

    return true;
  });

  if (filtered.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 9;
    td.style.textAlign = "center";
    td.style.padding = "16px 0";
    td.textContent = "Không có đơn hàng nào phù hợp.";
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  filtered.forEach((o) => {
    const tr = document.createElement("tr");

    const created = new Date(o.createdAt);
    const timeText = created.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dateText = created.toLocaleDateString("vi-VN");

    tr.innerHTML = `
      <td style="text-align:center">
        <input type="checkbox" class="order-row-checkbox order-checkbox" />
      </td>
      <td style="color:#22c55e; font-weight:600">${o.code}</td>
      <td>
        <div class="customer-cell">
          <div class="customer-avatar">
            ${
              o.avatar
                ? `<img src="${o.avatar}" alt="${o.customerName}" onerror="this.style.display='none'" />`
                : (o.customerName || "?").trim().charAt(0).toUpperCase()
            }
          </div>
          <div class="customer-info">
            <span class="customer-name">${o.customerName}</span>
            <span class="customer-phone">${o.phone || ""}</span>
          </div>
        </div>
      </td>
      <td class="product-count">
        ${o.items} sản phẩm
      </td>
      <td style="font-weight:600">
        ${formatCurrency(o.total)}
      </td>
      <td>
        <div class="payment-method">${o.paymentMethod}</div>
        <div class="payment-status">${o.paymentStatus}</div>
      </td>
      <td>
        ${renderStatusBadge(o.status)}
      </td>
      <td>
        <div>${timeText}</div>
        <div class="payment-status">${dateText}</div>
      </td>
      <td class="order-actions-cell">
        <button type="button" class="order-action-btn">⋯</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// ================== KPI & TAB COUNT ==================
function updateKpis() {
  const kpiPending = document.getElementById("kpiPending");
  const kpiProcessing = document.getElementById("kpiProcessing");
  const kpiShipping = document.getElementById("kpiShipping");
  const kpiCompleted = document.getElementById("kpiCompleted");

  const counts = {
    pending: 0,
    processing: 0,
    shipping: 0,
    completed: 0,
  };

  orders.forEach((o) => {
    if (o.status === ORDER_STATUS.PENDING) counts.pending++;
    else if (o.status === ORDER_STATUS.PROCESSING) counts.processing++;
    else if (o.status === ORDER_STATUS.SHIPPING) counts.shipping++;
    else if (o.status === ORDER_STATUS.COMPLETED) counts.completed++;
  });

  if (kpiPending) kpiPending.textContent = counts.pending;
  if (kpiProcessing) kpiProcessing.textContent = counts.processing;
  if (kpiShipping) kpiShipping.textContent = counts.shipping;
  if (kpiCompleted) kpiCompleted.textContent = counts.completed;
}

function updateTabCounts() {
  const totals = {
    all: orders.length,
    pending: 0,
    processing: 0,
    shipping: 0,
    completed: 0,
    canceled: 0,
  };

  orders.forEach((o) => {
    totals[o.status] = (totals[o.status] || 0) + 1;
  });

  document.querySelectorAll(".order-tab-count").forEach((span) => {
    const st = span.dataset.statusCount;
    if (st && typeof totals[st] !== "undefined") {
      span.textContent = `(${totals[st]})`;
    }
  });

  const allSpan = document.querySelector(
    ".order-tab-count[data-status-count='all']"
  );
  if (allSpan) allSpan.textContent = `(${totals.all})`;
}

function updateOrderNavBadge() {
  const badge = document.getElementById("orderNavBadge");
  if (!badge) return;
  badge.textContent = orders.length;
}

// ================== HELPERS ==================
function formatCurrency(value) {
  return value.toLocaleString("vi-VN") + "₫";
}

function renderStatusBadge(status) {
  let text = "";
  let cls = "";

  switch (status) {
    case ORDER_STATUS.PENDING:
      text = "Chờ xác nhận";
      cls = "pending";
      break;
    case ORDER_STATUS.PROCESSING:
      text = "Đang xử lý";
      cls = "processing";
      break;
    case ORDER_STATUS.SHIPPING:
      text = "Đang giao";
      cls = "shipping";
      break;
    case ORDER_STATUS.COMPLETED:
      text = "Đã giao";
      cls = "completed";
      break;
    case ORDER_STATUS.CANCELED:
      text = "Đã hủy";
      cls = "canceled";
      break;
    default:
      text = status;
  }

  return `<span class="order-status ${cls}">${text}</span>`;
}

function matchDateFilter(order, filter) {
  if (!order.createdAt) return true;
  const date = new Date(order.createdAt);
  const now = new Date();

  // Reset giờ để so ngày
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const startOfOrder = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diffMs = startOfToday - startOfOrder;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  switch (filter) {
    case "today":
      return diffDays === 0;
    case "yesterday":
      return diffDays === 1;
    case "7days":
      return diffDays >= 0 && diffDays <= 6;
    case "30days":
      return diffDays >= 0 && diffDays <= 29;
    case "all":
    default:
      return true;
  }
}
