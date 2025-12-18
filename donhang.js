/* =========================
   DONHANG.JS - SellerHub
   Dữ liệu mẫu + render giống ảnh
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const orderTable = document.getElementById("orderTable");
  if (!orderTable) {
    console.error("ERROR: orderTable element not found!");
    return;
  }
  
  // ========== CHECK URL PARAMETERS FOR CUSTOMER FILTER ==========
  const urlParams = new URLSearchParams(window.location.search);
  const customerFilter = urlParams.get("customer");
  const phoneFilter = urlParams.get("phone");
  
  // Nếu có filter khách hàng từ URL, tự động điền vào search
  if (customerFilter) {
    const orderSearch = document.getElementById("orderSearch");
    const orderSearchTopbar = document.getElementById("orderSearchTopbar");
    
    if (orderSearch) {
      orderSearch.value = customerFilter;
      // Trigger search event
      orderSearch.dispatchEvent(new Event("input", { bubbles: true }));
    }
    
    if (orderSearchTopbar) {
      orderSearchTopbar.value = customerFilter;
      orderSearchTopbar.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
  
  const tabs = document.querySelectorAll(".order-tab");
  const checkAll = document.getElementById("checkAllOrders");

  const kpiPending = document.getElementById("kpiPending");
  const kpiProcessing = document.getElementById("kpiProcessing");
  const kpiShipping = document.getElementById("kpiShipping");
  const kpiCompleted = document.getElementById("kpiCompleted");

  const orderNavBadge = document.getElementById("orderNavBadge");

  const dateTrigger = document.getElementById("dateTrigger");
  const dateLabel = document.getElementById("dateLabel");
  const dateFilter = document.querySelector(".date-filter");
  const dateMenu = document.querySelector(".date-menu");
  const dateOptions = document.querySelectorAll(".date-option");

  // ========= Helpers =========
  const pad2 = (n) => String(n).padStart(2, "0");

  const formatMoney = (v) => {
    // 34990000 -> 34.990.000₫
    try {
      return Number(v).toLocaleString("vi-VN") + "₫";
    } catch {
      return v + "₫";
    }
  };

  const formatDateTime = (d) => {
    const date = new Date(d);
    return `${pad2(date.getHours())}:${pad2(date.getMinutes())} ${pad2(
      date.getDate()
    )}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
  };

  const daysAgo = (n, hh = 12, mm = 0) => {
    const d = new Date();
    d.setHours(hh, mm, 0, 0);
    d.setDate(d.getDate() - n);
    return d.toISOString();
  };

  const statusMeta = {
    pending: { text: "Chờ xác nhận", cls: "st-pending" },
    processing: { text: "Đang xử lý", cls: "st-processing" },
    shipping: { text: "Đang giao", cls: "st-shipping" },
    completed: { text: "Đã giao", cls: "st-completed" },
    canceled: { text: "Đã hủy", cls: "st-canceled" },
  };
  
  // Expose helper functions globally for export/print
  window.formatMoney = formatMoney;
  window.formatDateTime = formatDateTime;
  window.statusMeta = statusMeta;

  // ========= HÀM LƯU/LOAD ĐƠN HÀNG TỪ LOCALSTORAGE =========
  // Load đơn hàng từ localStorage, nếu chưa có thì trả về null
  function loadOrdersFromStorage() {
    const stored = localStorage.getItem("orders");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed;
      } catch (e) {
        console.error("Lỗi khi đọc orders từ localStorage:", e);
      }
    }
    return null;
  }

  // Lưu đơn hàng vào localStorage
  function saveOrdersToStorage(orders) {
    try {
      localStorage.setItem("orders", JSON.stringify(orders));
    } catch (e) {
      console.error("Lỗi khi lưu orders vào localStorage:", e);
    }
  }

  // ========= HÀM ĐỒNG BỘ SẢN PHẨM TỪ LOCALSTORAGE =========
  // Hàm này đồng bộ sản phẩm trong đơn hàng với danh sách sản phẩm từ phần Quản lý sản phẩm
  // CHỈ sử dụng sản phẩm có trong danh sách sản phẩm (localStorage "products")
  function syncProductsFromStore(orders) {
    const allProducts = JSON.parse(localStorage.getItem("products") || "[]");
    
    if (allProducts.length === 0) {
      // Nếu không có sản phẩm nào trong store, trả về orders như cũ
      return orders;
    }
    
    return orders.map(order => {
      const updatedProducts = order.products
        .map(orderProduct => {
          // Tìm sản phẩm trong localStorage
          let productFromStore = null;
          
          // Tìm theo productId nếu có
          if (orderProduct.productId) {
            productFromStore = allProducts.find(p => p.id === orderProduct.productId || p.sku === orderProduct.productId);
          }
          
          // Nếu không tìm thấy, tìm theo tên (exact match)
          if (!productFromStore && orderProduct.name) {
            productFromStore = allProducts.find(p => p.name.trim() === orderProduct.name.trim());
          }
          
          // CHỈ sử dụng sản phẩm nếu tìm thấy trong store
          if (productFromStore) {
            return {
              ...orderProduct,
              productId: productFromStore.id || productFromStore.sku,
              name: productFromStore.name,
              price: productFromStore.price,
              image: productFromStore.image || null,
            };
          }
          
          // Nếu không tìm thấy trong store, trả về null để filter bỏ
          return null;
        })
        .filter(p => p !== null); // Chỉ giữ lại sản phẩm có trong store
      
      // Nếu không còn sản phẩm nào hợp lệ, giữ nguyên đơn hàng
      if (updatedProducts.length === 0) {
        return order;
      }
      
      // Tính lại tổng tiền dựa trên giá mới từ store
      const newTotal = updatedProducts.reduce((sum, p) => sum + (p.price * (p.quantity || 1)), 0);
      
      return {
        ...order,
        products: updatedProducts,
        total: newTotal,
      };
    });
  }

  // ========= DỮ LIỆU MẪU (như hình) =========
  // Lưu ý: createdAt dùng daysAgo để “Hôm nay / Hôm qua” luôn hoạt động
  const ordersSeedDefault = [
    {
      code: "#DH-12345",
      customer: { 
        name: "Trần Văn A", 
        phone: "0912 345 678", 
        email: "tranvana@email.com",
        avatar: "TA" 
      },
      products: [{ 
        emoji: "📱", 
        name: "iPhone 15 Pro Max 256GB", 
        quantity: 1, 
        price: 34990000 
      }],
      total: 34990000,
      payment: { method: "COD", paid: false },
      status: "pending",
      createdAt: daysAgo(0, 14, 30),
      shippingAddress: "123 Nguyễn Văn Linh, Q.7, TP.HCM",
      note: "Gọi trước khi giao"
    },
    {
      code: "#DH-12344",
      customer: { 
        name: "Nguyễn Thị B", 
        phone: "0987 654 321", 
        email: "nguyenthib@email.com",
        avatar: "NB" 
      },
      products: [
        { emoji: "⌚", name: "Apple Watch Series 9", quantity: 1, price: 12480000 },
        { emoji: "🎧", name: "AirPods Pro 2", quantity: 1, price: 22000000 }
      ],
      total: 34480000,
      payment: { method: "Banking", paid: true },
      status: "processing",
      createdAt: daysAgo(0, 12, 15),
      shippingAddress: "456 Lê Lợi, Q.1, TP.HCM",
      note: ""
    },
    {
      code: "#DH-12343",
      customer: { 
        name: "Lê Hoàng C", 
        phone: "0909 123 456", 
        email: "lehoangc@email.com",
        avatar: "LC" 
      },
      products: [{ 
        emoji: "💻", 
        name: "MacBook Pro 14 inch M3", 
        quantity: 1, 
        price: 12980000 
      }],
      total: 12980000,
      payment: { method: "Momo", paid: true },
      status: "shipping",
      createdAt: daysAgo(1, 18, 45),
      shippingAddress: "789 Trần Hưng Đạo, Q.5, TP.HCM",
      note: ""
    },
    {
      code: "#DH-12342",
      customer: { 
        name: "Phạm Minh D", 
        phone: "0978 111 222", 
        email: "phamminhd@email.com",
        avatar: "PD" 
      },
      products: [{ 
        emoji: "🖥️", 
        name: "iMac 24 inch M3", 
        quantity: 1, 
        price: 31990000 
      }],
      total: 31990000,
      payment: { method: "Credit Card", paid: true },
      status: "completed",
      createdAt: daysAgo(2, 10, 20),
      shippingAddress: "321 Nguyễn Huệ, Q.1, TP.HCM",
      note: ""
    },
    {
      code: "#DH-12341",
      customer: { 
        name: "Võ Thị E", 
        phone: "0935 999 888", 
        email: "vothie@email.com",
        avatar: "VE" 
      },
      products: [{ 
        emoji: "🎒", 
        name: "Túi xách cao cấp", 
        quantity: 1, 
        price: 21990000 
      }],
      total: 21990000,
      payment: { method: "Banking", paid: false },
      status: "canceled",
      createdAt: daysAgo(3, 9, 0),
      shippingAddress: "654 Võ Văn Tần, Q.3, TP.HCM",
      note: ""
    },
  ];

  // ========= State =========
  const state = {
    status: "all", // all | pending | processing | shipping | completed | canceled
    search: customerFilter || "", // Set search từ URL parameter nếu có
    dateRange: "all", // today | yesterday | 7days | 30days | all | custom | byDate | byMonth | byYear
    openMenuCode: null,
    customDateRange: null, // { start: "YYYY-MM-DD", end: "YYYY-MM-DD" }
    selectedDate: null, // "YYYY-MM-DD" cho byDate
    selectedMonth: null, // { month: 1-12, year: YYYY } cho byMonth
    selectedYear: null, // YYYY cho byYear
  };
  
  // Load orders từ localStorage hoặc dùng default
  let ordersSeed = loadOrdersFromStorage();
  if (!ordersSeed) {
    // Nếu chưa có trong localStorage, dùng default và lưu vào
    ordersSeed = ordersSeedDefault;
    saveOrdersToStorage(ordersSeed);
  } else {
    // Merge với default để đảm bảo có đầy đủ đơn hàng (trường hợp thêm đơn hàng mới vào default)
    // Tạo map từ orders đã lưu để dễ tìm
    const savedOrdersMap = new Map(ordersSeed.map(o => [o.code, o]));
    // Thêm các đơn hàng mới từ default nếu chưa có
    ordersSeedDefault.forEach(defaultOrder => {
      if (!savedOrdersMap.has(defaultOrder.code)) {
        ordersSeed.push(defaultOrder);
      }
    });
    // Cập nhật lại localStorage
    saveOrdersToStorage(ordersSeed);
  }

  // Expose state and ordersSeed globally for export/print functions
  window.orderState = state;
  window.ordersSeed = ordersSeed;

  // ========= Filter =========
  const inDateRange = (iso, range, customDateRange = null, selectedDate = null, selectedMonth = null, selectedYear = null) => {
    if (range === "all") return true;
    if (!iso) return false;

    const d = new Date(iso);
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfDay = (x) => {
      const t = new Date(x);
      t.setHours(0, 0, 0, 0);
      return t;
    };

    if (range === "today") {
      return startOfDay(d).getTime() === startOfToday.getTime();
    }

    if (range === "yesterday") {
      const y = new Date(startOfToday);
      y.setDate(y.getDate() - 1);
      return startOfDay(d).getTime() === y.getTime();
    }

    if (range === "custom" && customDateRange) {
      const orderDate = startOfDay(d);
      const startDate = new Date(customDateRange.start);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(customDateRange.end);
      endDate.setHours(23, 59, 59, 999);
      return orderDate >= startDate && orderDate <= endDate;
    }

    // Filter theo ngày cụ thể
    if (range === "byDate" && selectedDate) {
      const orderDate = startOfDay(d);
      const targetDate = new Date(selectedDate);
      targetDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === targetDate.getTime();
    }

    // Filter theo tháng
    if (range === "byMonth" && selectedMonth) {
      const orderYear = d.getFullYear();
      const orderMonth = d.getMonth() + 1; // getMonth() trả về 0-11
      return orderYear === selectedMonth.year && orderMonth === selectedMonth.month;
    }

    // Filter theo năm
    if (range === "byYear" && selectedYear) {
      const orderYear = d.getFullYear();
      return orderYear === selectedYear;
    }

    const diffMs = now.getTime() - d.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (range === "7days") return diffDays <= 7;
    if (range === "30days") return diffDays <= 30;

    return true;
  };

  const applySearch = (o, q) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      o.code?.toLowerCase().includes(s) ||
      o.customer?.name?.toLowerCase().includes(s) ||
      o.customer?.phone?.includes(s)
    );
  };

  // ========= UI update =========
  const setTabCountsAndKpi = (baseList) => {
    const counts = {
      all: baseList.length,
      pending: 0,
      processing: 0,
      shipping: 0,
      completed: 0,
      canceled: 0,
    };

    baseList.forEach((o) => {
      counts[o.status] = (counts[o.status] ?? 0) + 1;
    });

    // Tab counts
    document.querySelectorAll("[data-status-count]").forEach((el) => {
      const key = el.getAttribute("data-status-count");
      el.textContent = counts[key] ?? 0;
    });

    // KPI (4 card)
    kpiPending.textContent = counts.pending ?? 0;
    kpiProcessing.textContent = counts.processing ?? 0;
    kpiShipping.textContent = counts.shipping ?? 0;
    kpiCompleted.textContent = counts.completed ?? 0;

    // Badge sidebar (tổng đơn trong filter)
    if (orderNavBadge) orderNavBadge.textContent = counts.all ?? 0;
  };

  const rowHTML = (o) => {
    if (!o || !o.code) return "";
    
    const s = statusMeta[o.status] || statusMeta.pending;
    const productCount = o.products?.length ?? 0;
    const productEmoji = o.products?.[0]?.emoji ?? "📦";

    const paySub = o.payment?.paid ? "Đã thanh toán" : "Chưa thanh toán";
    const paySubCls = o.payment?.paid ? "pay-paid" : "pay-unpaid";

    const menuOpen = state.openMenuCode === o.code;

    return `
      <tr class="order-row">
        <td style="text-align:center">
          <input type="checkbox" class="order-check" data-code="${o.code}">
        </td>

        <td class="order-code">${o.code}</td>

        <td>
          <div class="cust">
            <div class="cust-avatar">${o.customer?.avatar || "U"}</div>
            <div class="cust-meta">
              <div class="cust-name">${o.customer?.name || "N/A"}</div>
              <div class="cust-phone">${o.customer?.phone || ""}</div>
            </div>
          </div>
        </td>

        <td>
          ${(() => {
            // Lấy sản phẩm từ localStorage để hiển thị giống phần quản lý sản phẩm
            const allProducts = JSON.parse(localStorage.getItem("products") || "[]");
            const firstProduct = o.products?.[0];
            let productFromStore = null;
            let productName = firstProduct?.name || "Sản phẩm";
            let productImage = null;
            let displayThumb = productEmoji;
            
            if (firstProduct) {
              // Tìm sản phẩm trong localStorage
              if (firstProduct.productId) {
                productFromStore = allProducts.find(p => p.id === firstProduct.productId || p.sku === firstProduct.productId);
              }
              if (!productFromStore && firstProduct.name) {
                productFromStore = allProducts.find(p => p.name === firstProduct.name);
              }
              
              if (productFromStore) {
                productName = productFromStore.name || productName;
                productImage = productFromStore.image || null;
                if (productImage) {
                  displayThumb = `<img src="${productImage}" alt="${productName}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;" onerror="this.outerHTML='<div class=\\"prod-thumb\\">${productEmoji}</div>';" />`;
                }
              }
            }
            
            // Hiển thị tên sản phẩm và số lượng nếu có nhiều sản phẩm
            const productDisplayName = productCount > 1 
              ? `${productName} + ${productCount - 1} sản phẩm khác`
              : productName;
            
            return `
              <div class="prod">
                ${typeof displayThumb === 'string' && displayThumb.includes('<img') 
                  ? displayThumb 
                  : `<div class="prod-thumb">${displayThumb}</div>`}
                <div class="prod-meta">
                  <div class="prod-name" style="font-size: 13px; font-weight: 500; color: var(--text); line-height: 1.4;">${productDisplayName}</div>
                  ${productCount > 1 ? `<div class="prod-count" style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${productCount} sản phẩm</div>` : ''}
                </div>
              </div>
            `;
          })()}
        </td>

        <td class="order-total">${formatMoney(o.total)}</td>

        <td>
          <div class="pay">
            <div class="pay-method">${o.payment?.method || "N/A"}</div>
            <div class="pay-sub ${paySubCls}">${paySub}</div>
          </div>
        </td>

        <td>
          <span class="status-pill ${s.cls}">${s.text}</span>
        </td>

        <td class="order-time">${formatDateTime(o.createdAt)}</td>

        <td class="order-actions-cell">
          <div class="action-menu ${menuOpen ? "open" : ""}">
            <button class="action-toggle" data-action="toggleMenu" data-code="${
              o.code
            }" aria-label="menu">⋯</button>
            <div class="action-dropdown" data-menu="${
      o.code
    }">
              <button class="action-item" data-action="viewDetail" data-code="${
                o.code
              }">👁 Xem chi tiết</button>
              <button class="action-item" data-action="printOrder" data-code="${
                o.code
              }">🖨 In đơn hàng</button>
              ${
                o.status === "pending"
                  ? `<button class="action-item" data-action="confirmOrder" data-code="${o.code}">✅ Xác nhận đơn</button>`
                  : ""
              }
              ${
                o.status === "pending" || o.status === "processing"
                  ? `<button class="action-item danger" data-action="cancelOrder" data-code="${o.code}">❌ Hủy đơn</button>`
                  : ""
              }
              ${
                o.status === "pending"
                  ? `<button class="action-item" data-action="setStatus" data-code="${o.code}" data-status="processing">Chuyển Đang xử lý</button>`
                  : ""
              }
              ${
                o.status === "processing"
                  ? `<button class="action-item" data-action="setStatus" data-code="${o.code}" data-status="shipping">Chuyển Đang giao</button>`
                  : ""
              }
              ${
                o.status === "shipping"
                  ? `<button class="action-item" data-action="setStatus" data-code="${o.code}" data-status="completed">Chuyển Đã giao</button>`
                  : ""
              }
            </div>
          </div>
        </td>
      </tr>
    `;
  };

  const render = () => {
    if (!orderTable) {
      console.error("orderTable not found!");
      return;
    }
    
    // Kiểm tra ordersSeed
    if (!ordersSeed || ordersSeed.length === 0) {
      console.error("ordersSeed is empty or undefined!");
      orderTable.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-muted);">
            Không có dữ liệu đơn hàng
          </td>
        </tr>
      `;
      return;
    }
    
    // Đồng bộ sản phẩm từ localStorage (phần Quản lý sản phẩm)
    const syncedOrders = syncProductsFromStore(ordersSeed);
    
    // baseList: chỉ filter theo date + search (để tab count/KPI đúng)
    const baseList = syncedOrders.filter(
      (o) =>
        inDateRange(o.createdAt, state.dateRange, state.customDateRange, state.selectedDate, state.selectedMonth, state.selectedYear) &&
        applySearch(o, state.search)
    );

    setTabCountsAndKpi(baseList);

    // list: baseList + filter theo tab status
    const list =
      state.status === "all"
        ? baseList
        : baseList.filter((o) => o.status === state.status);

    // Render bảng
    if (list.length === 0) {
      orderTable.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-muted);">
            Không có đơn hàng nào
          </td>
        </tr>
      `;
    } else {
      try {
        orderTable.innerHTML = list.map(rowHTML).join("");
      } catch (error) {
        console.error("Error rendering orders:", error);
        orderTable.innerHTML = `
          <tr>
            <td colspan="9" style="text-align: center; padding: 40px; color: red;">
              Lỗi khi hiển thị đơn hàng: ${error.message}
            </td>
          </tr>
        `;
      }
    }

    // reset checkAll
    if (checkAll) checkAll.checked = false;
  };

  // ========= Events: Tabs =========
  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.forEach((x) => x.classList.remove("active"));
      btn.classList.add("active");
      state.status = btn.dataset.status;
      state.openMenuCode = null;
      render();
    });
  });

  // ========= Events: Search =========
  // Tìm tất cả các search input (topbar và filter-group)
  const orderSearchTopbar = document.getElementById("orderSearchTopbar");
  const orderSearchFilter = document.getElementById("orderSearch");
  
  const handleSearch = (value) => {
    state.search = value.trim();
    state.openMenuCode = null;
    render();
  };
  
  if (orderSearchTopbar) {
    orderSearchTopbar.addEventListener("input", (e) => {
      handleSearch(e.target.value);
    });
  }
  
  if (orderSearchFilter) {
    orderSearchFilter.addEventListener("input", (e) => {
      handleSearch(e.target.value);
    });
  }

  // ========= Events: Date filter dropdown =========
  const closeDateMenu = () => dateFilter?.classList.remove("open");
  const toggleDateMenu = () => dateFilter?.classList.toggle("open");

  if (dateTrigger && dateFilter) {
    dateTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleDateMenu();
    });

    document.addEventListener("click", (e) => {
      // Chỉ đóng menu nếu click bên ngoài date-filter
      if (!e.target.closest(".date-filter")) {
        closeDateMenu();
      }
    });

    dateOptions.forEach((opt) => {
      opt.addEventListener("click", (e) => {
        const range = opt.dataset.range;
        
        // Xử lý các modal đặc biệt
        if (range === "custom") {
          openCustomDateRangeModal();
          closeDateMenu();
          return;
        }
        
        if (range === "byDate") {
          openSelectDateModal();
          closeDateMenu();
          return;
        }
        
        if (range === "byMonth") {
          openSelectMonthModal();
          closeDateMenu();
          return;
        }
        
        if (range === "byYear") {
          openSelectYearModal();
          closeDateMenu();
          return;
        }
        
        // Reset các filter đặc biệt khi chọn filter thông thường (bao gồm "all")
        state.selectedDate = null;
        state.selectedMonth = null;
        state.selectedYear = null;
        state.customDateRange = null;
        
        state.dateRange = range;

        // label
        const map = {
          today: "Hôm nay",
          yesterday: "Hôm qua",
          "7days": "7 ngày qua",
          "30days": "30 ngày qua",
          custom: "Tùy chỉnh",
          all: "Tất cả",
          byDate: "Theo ngày",
          byMonth: "Theo tháng",
          byYear: "Theo năm",
        };
        if (dateLabel) dateLabel.textContent = map[range] || "Tất cả";

        state.openMenuCode = null;
        closeDateMenu();
        render();
      });
    });
  }

  // ========= Events: Check all =========
  if (checkAll) {
    checkAll.addEventListener("change", () => {
      const checks = document.querySelectorAll(".order-check");
      checks.forEach((c) => (c.checked = checkAll.checked));
    });
  }

  // ========= Events: Actions (menu + status change) =========
  document.addEventListener("click", (e) => {
    // Kiểm tra nếu click vào action menu trong bảng đơn hàng
    const actionMenu = e.target.closest(".order-actions-cell .action-menu");
    if (!actionMenu) {
      // Click ngoài action menu -> đóng tất cả menu
      if (state.openMenuCode) {
        state.openMenuCode = null;
        render();
      }
      return;
    }

    // Xử lý toggle menu
    const toggleBtn = e.target.closest(".action-toggle[data-action='toggleMenu']");
    if (toggleBtn) {
      e.stopPropagation();
      e.preventDefault();
      const code = toggleBtn.dataset.code;
      state.openMenuCode = state.openMenuCode === code ? null : code;
      render();
      return;
    }

    // Xử lý các action items
    const actionItem = e.target.closest(".action-item[data-action]");
    if (actionItem) {
      e.stopPropagation();
      e.preventDefault();
      
      const action = actionItem.dataset.action;
      const code = actionItem.dataset.code;

      if (action === "setStatus") {
        const newStatus = actionItem.dataset.status;
        const idx = ordersSeed.findIndex((x) => x.code === code);
        if (idx >= 0) {
          ordersSeed[idx].status = newStatus;
          // Lưu vào localStorage khi thay đổi trạng thái
          saveOrdersToStorage(ordersSeed);
        }
        state.openMenuCode = null;
        render();
        return;
      }

      if (action === "viewDetail") {
        openOrderDetailModal(code);
        state.openMenuCode = null;
        render();
        return;
      }

      if (action === "printOrder") {
        window.print();
        state.openMenuCode = null;
        render();
        return;
      }

      if (action === "confirmOrder") {
        const idx = ordersSeed.findIndex((x) => x.code === code);
        if (idx >= 0) {
          ordersSeed[idx].status = "processing";
          // Lưu vào localStorage khi thay đổi trạng thái
          saveOrdersToStorage(ordersSeed);
        }
        state.openMenuCode = null;
        render();
        return;
      }

      if (action === "cancelOrder") {
        if (confirm(`Bạn có chắc chắn muốn hủy đơn hàng ${code}?`)) {
          const idx = ordersSeed.findIndex((x) => x.code === code);
          if (idx >= 0) {
            ordersSeed[idx].status = "canceled";
            // Lưu vào localStorage khi thay đổi trạng thái
            saveOrdersToStorage(ordersSeed);
          }
          state.openMenuCode = null;
          render();
        }
        return;
      }
    }
  });

  // ========= Export Excel =========
  const exportExcelBtn = document.getElementById("exportExcelBtn");
  if (exportExcelBtn) {
    exportExcelBtn.addEventListener("click", () => {
      exportOrdersToExcel();
    });
  }

  // ========= Print Orders =========
  const printOrderBtn = document.getElementById("printOrderBtn");
  if (printOrderBtn) {
    printOrderBtn.addEventListener("click", () => {
      printOrders();
    });
  }

  // ========= Custom Date Range Modal =========
  const customDateModal = document.getElementById("customDateModal");
  const closeCustomDateModal = document.getElementById("closeCustomDateModal");
  const cancelCustomDate = document.getElementById("cancelCustomDate");
  const applyCustomDate = document.getElementById("applyCustomDate");
  const customDateStart = document.getElementById("customDateStart");
  const customDateEnd = document.getElementById("customDateEnd");
  
  const openCustomDateRangeModal = () => {
    if (!customDateModal) return;
    
    // Set default dates (30 days ago to today)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (customDateStart) {
      customDateStart.value = thirtyDaysAgo.toISOString().split('T')[0];
    }
    if (customDateEnd) {
      customDateEnd.value = today.toISOString().split('T')[0];
    }
    
    customDateModal.style.display = "flex";
  };
  
  const closeModal = () => {
    if (customDateModal) customDateModal.style.display = "none";
  };
  
  if (closeCustomDateModal) {
    closeCustomDateModal.addEventListener("click", closeModal);
  }
  
  if (cancelCustomDate) {
    cancelCustomDate.addEventListener("click", closeModal);
  }
  
  if (applyCustomDate) {
    applyCustomDate.addEventListener("click", () => {
      const startDate = customDateStart?.value;
      const endDate = customDateEnd?.value;
      
      if (!startDate || !endDate) {
        alert("Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc!");
        return;
      }
      
      if (new Date(startDate) > new Date(endDate)) {
        alert("Ngày bắt đầu không thể lớn hơn ngày kết thúc!");
        return;
      }
      
      // Reset other filters
      state.selectedDate = null;
      state.selectedMonth = null;
      state.selectedYear = null;
      
      // Lưu custom date range vào state
      state.customDateRange = {
        start: startDate,
        end: endDate
      };
      state.dateRange = "custom";
      
      if (dateLabel) {
        dateLabel.textContent = `${startDate} - ${endDate}`;
      }
      
      closeModal();
      if (window.orderRender) {
        window.orderRender();
      } else {
        render();
      }
    });
  }
  
  if (customDateModal) {
    customDateModal.addEventListener("click", (e) => {
      if (e.target === customDateModal) closeModal();
    });
  }
  
  // Expose function globally
  window.openCustomDateRangeModal = openCustomDateRangeModal;
  
  // ========= Select Date Modal (Theo ngày) =========
  const selectDateModal = document.getElementById("selectDateModal");
  const closeSelectDateModal = document.getElementById("closeSelectDateModal");
  const cancelSelectDate = document.getElementById("cancelSelectDate");
  const applySelectDate = document.getElementById("applySelectDate");
  const selectDateInput = document.getElementById("selectDate");
  
  const openSelectDateModal = () => {
    if (!selectDateModal) return;
    
    // Set default to today
    if (selectDateInput) {
      const today = new Date();
      selectDateInput.value = today.toISOString().split('T')[0];
    }
    
    selectDateModal.style.display = "flex";
  };
  
  const closeSelectDateModalFunc = () => {
    if (selectDateModal) selectDateModal.style.display = "none";
  };
  
  if (closeSelectDateModal) {
    closeSelectDateModal.addEventListener("click", closeSelectDateModalFunc);
  }
  
  if (cancelSelectDate) {
    cancelSelectDate.addEventListener("click", closeSelectDateModalFunc);
  }
  
  if (applySelectDate) {
    applySelectDate.addEventListener("click", () => {
      const date = selectDateInput?.value;
      
      if (!date) {
        alert("Vui lòng chọn ngày!");
        return;
      }
      
      // Reset other filters
      state.customDateRange = null;
      state.selectedMonth = null;
      state.selectedYear = null;
      
      // Set selected date
      state.selectedDate = date;
      state.dateRange = "byDate";
      
      // Update label
      if (dateLabel) {
        const dateObj = new Date(date);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        dateLabel.textContent = `${day}/${month}/${year}`;
      }
      
      closeSelectDateModalFunc();
      render();
    });
  }
  
  if (selectDateModal) {
    selectDateModal.addEventListener("click", (e) => {
      if (e.target === selectDateModal) closeSelectDateModalFunc();
    });
  }
  
  // ========= Select Month Modal (Theo tháng) =========
  const selectMonthModal = document.getElementById("selectMonthModal");
  const closeSelectMonthModal = document.getElementById("closeSelectMonthModal");
  const cancelSelectMonth = document.getElementById("cancelSelectMonth");
  const applySelectMonth = document.getElementById("applySelectMonth");
  const selectMonthInput = document.getElementById("selectMonth");
  const selectMonthYearInput = document.getElementById("selectMonthYear");
  
  const openSelectMonthModal = () => {
    if (!selectMonthModal) return;
    
    // Set default to current month
    const today = new Date();
    if (selectMonthInput) {
      selectMonthInput.value = today.getMonth() + 1;
    }
    if (selectMonthYearInput) {
      selectMonthYearInput.value = today.getFullYear();
    }
    
    selectMonthModal.style.display = "flex";
  };
  
  const closeSelectMonthModalFunc = () => {
    if (selectMonthModal) selectMonthModal.style.display = "none";
  };
  
  if (closeSelectMonthModal) {
    closeSelectMonthModal.addEventListener("click", closeSelectMonthModalFunc);
  }
  
  if (cancelSelectMonth) {
    cancelSelectMonth.addEventListener("click", closeSelectMonthModalFunc);
  }
  
  if (applySelectMonth) {
    applySelectMonth.addEventListener("click", () => {
      const month = selectMonthInput?.value;
      const year = selectMonthYearInput?.value;
      
      if (!month || !year) {
        alert("Vui lòng chọn đầy đủ tháng và năm!");
        return;
      }
      
      // Reset other filters
      state.customDateRange = null;
      state.selectedDate = null;
      state.selectedYear = null;
      
      // Set selected month
      state.selectedMonth = {
        month: parseInt(month),
        year: parseInt(year)
      };
      state.dateRange = "byMonth";
      
      // Update label
      if (dateLabel) {
        const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", 
                           "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
        dateLabel.textContent = `${monthNames[parseInt(month) - 1]}/${year}`;
      }
      
      closeSelectMonthModalFunc();
      render();
    });
  }
  
  if (selectMonthModal) {
    selectMonthModal.addEventListener("click", (e) => {
      if (e.target === selectMonthModal) closeSelectMonthModalFunc();
    });
  }
  
  // ========= Select Year Modal (Theo năm) =========
  const selectYearModal = document.getElementById("selectYearModal");
  const closeSelectYearModal = document.getElementById("closeSelectYearModal");
  const cancelSelectYear = document.getElementById("cancelSelectYear");
  const applySelectYear = document.getElementById("applySelectYear");
  const selectYearInput = document.getElementById("selectYear");
  
  const openSelectYearModal = () => {
    if (!selectYearModal) return;
    
    // Set default to current year
    if (selectYearInput) {
      const today = new Date();
      selectYearInput.value = today.getFullYear();
    }
    
    selectYearModal.style.display = "flex";
  };
  
  const closeSelectYearModalFunc = () => {
    if (selectYearModal) selectYearModal.style.display = "none";
  };
  
  if (closeSelectYearModal) {
    closeSelectYearModal.addEventListener("click", closeSelectYearModalFunc);
  }
  
  if (cancelSelectYear) {
    cancelSelectYear.addEventListener("click", closeSelectYearModalFunc);
  }
  
  if (applySelectYear) {
    applySelectYear.addEventListener("click", () => {
      const year = selectYearInput?.value;
      
      if (!year) {
        alert("Vui lòng chọn năm!");
        return;
      }
      
      // Reset other filters
      state.customDateRange = null;
      state.selectedDate = null;
      state.selectedMonth = null;
      
      // Set selected year
      state.selectedYear = parseInt(year);
      state.dateRange = "byYear";
      
      // Update label
      if (dateLabel) {
        dateLabel.textContent = `Năm ${year}`;
      }
      
      closeSelectYearModalFunc();
      render();
    });
  }
  
  if (selectYearModal) {
    selectYearModal.addEventListener("click", (e) => {
      if (e.target === selectYearModal) closeSelectYearModalFunc();
    });
  }
  
  // Expose functions globally
  window.openSelectDateModal = openSelectDateModal;
  window.openSelectMonthModal = openSelectMonthModal;
  window.openSelectYearModal = openSelectYearModal;
  
  // ========= Order Detail Modal =========
  const orderDetailModal = document.getElementById("orderDetailModal");
  const closeOrderDetailModal = document.getElementById("closeOrderDetailModal");
  const printOrderDetailBtn = document.getElementById("printOrderDetailBtn");
  const cancelOrderDetailBtn = document.getElementById("cancelOrderDetailBtn");
  const confirmOrderDetailBtn = document.getElementById("confirmOrderDetailBtn");
  
  const openOrderDetailModal = (orderCode) => {
    if (!orderDetailModal) return;
    
    // Đồng bộ sản phẩm từ localStorage trước khi hiển thị chi tiết
    const syncedOrders = syncProductsFromStore(ordersSeed);
    const order = syncedOrders.find(o => o.code === orderCode) || ordersSeed.find(o => o.code === orderCode);
    
    if (!order) {
      console.error("Order not found:", orderCode);
      return;
    }
    if (!order) {
      alert("Không tìm thấy đơn hàng!");
      return;
    }
    
    // Populate modal với dữ liệu đơn hàng
    const titleEl = document.getElementById("orderDetailTitle");
    const timeEl = document.getElementById("orderDetailTime");
    const avatarEl = document.getElementById("orderDetailAvatar");
    const customerNameEl = document.getElementById("orderDetailCustomerName");
    const customerPhoneEl = document.getElementById("orderDetailCustomerPhone");
    const customerEmailEl = document.getElementById("orderDetailCustomerEmail");
    const statusBadgeEl = document.getElementById("orderDetailStatusBadge");
    const productsEl = document.getElementById("orderDetailProducts");
    const addressEl = document.getElementById("orderDetailAddress");
    const noteEl = document.getElementById("orderDetailNote");
    const paymentMethodEl = document.getElementById("orderDetailPaymentMethod");
    const totalEl = document.getElementById("orderDetailTotal");
    
    // Title và thời gian
    if (titleEl) titleEl.textContent = `Chi tiết đơn hàng ${order.code}`;
    if (timeEl) {
      const orderDate = new Date(order.createdAt);
      const timeStr = formatDateTime(order.createdAt);
      timeEl.textContent = `Đặt lúc ${timeStr}`;
    }
    
    // Thông tin khách hàng
    if (avatarEl) avatarEl.textContent = order.customer.avatar;
    if (customerNameEl) customerNameEl.textContent = order.customer.name;
    if (customerPhoneEl) customerPhoneEl.textContent = order.customer.phone;
    if (customerEmailEl) {
      customerEmailEl.textContent = order.customer.email || "";
      customerEmailEl.style.display = order.customer.email ? "block" : "none";
    }
    
    // Trạng thái
    if (statusBadgeEl) {
      const statusInfo = statusMeta[order.status] || statusMeta.pending;
      statusBadgeEl.innerHTML = `<span class="status-pill ${statusInfo.cls}">${statusInfo.text}</span>`;
    }
    
    // Sản phẩm - Lấy từ localStorage (phần sản phẩm)
    if (productsEl) {
      // Lấy danh sách sản phẩm từ localStorage
      const allProducts = JSON.parse(localStorage.getItem("products") || "[]");
      
      productsEl.innerHTML = order.products.map(p => {
        // Tìm sản phẩm trong localStorage dựa trên tên hoặc id
        let productFromStore = null;
        if (p.productId) {
          // Nếu có productId, tìm theo id
          productFromStore = allProducts.find(prod => prod.id === p.productId || prod.sku === p.productId);
        }
        if (!productFromStore && p.name) {
          // Nếu không tìm thấy theo id, tìm theo tên
          productFromStore = allProducts.find(prod => prod.name === p.name);
        }
        
        // Sử dụng thông tin từ localStorage nếu có, nếu không thì dùng thông tin trong order
        const displayName = productFromStore?.name || p.name || "Sản phẩm";
        const displayPrice = productFromStore?.price || p.price || (order.total / order.products.length);
        const displayImage = productFromStore?.image || null;
        const displayEmoji = productFromStore?.image ? null : (p.emoji || "📦");
        
        return `
          <div class="order-detail-product">
            ${displayImage 
              ? `<img src="${displayImage}" alt="${displayName}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />`
              : ''
            }
            <div class="order-detail-product-emoji" style="${displayImage ? 'display: none;' : ''}">${displayEmoji}</div>
            <div class="order-detail-product-info">
              <div class="order-detail-product-name">${displayName}</div>
              <div class="order-detail-product-quantity">Số lượng: ${p.quantity || 1}</div>
            </div>
            <div class="order-detail-product-price">${formatMoney(displayPrice)}</div>
          </div>
        `;
      }).join("");
    }
    
    // Địa chỉ và ghi chú
    if (addressEl) addressEl.textContent = order.shippingAddress || "Chưa có địa chỉ";
    if (noteEl) {
      if (order.note) {
        noteEl.textContent = `Ghi chú: ${order.note}`;
        noteEl.style.display = "block";
      } else {
        noteEl.style.display = "none";
      }
    }
    
    // Thanh toán và tổng
    if (paymentMethodEl) paymentMethodEl.textContent = order.payment.method;
    if (totalEl) totalEl.textContent = formatMoney(order.total);
    
    // Hiển thị/ẩn các nút theo trạng thái
    if (confirmOrderDetailBtn) {
      if (order.status === "pending") {
        confirmOrderDetailBtn.style.display = "flex";
        confirmOrderDetailBtn.disabled = false;
      } else {
        confirmOrderDetailBtn.style.display = "none";
      }
    }
    
    if (cancelOrderDetailBtn) {
      if (order.status === "pending" || order.status === "processing") {
        cancelOrderDetailBtn.style.display = "flex";
      } else {
        cancelOrderDetailBtn.style.display = "none";
      }
    }
    
    // Lưu order code để dùng cho các action
    orderDetailModal.dataset.orderCode = orderCode;
    
    // Hiển thị modal
    orderDetailModal.style.display = "flex";
  };
  
  const closeOrderDetailModalFunc = () => {
    if (orderDetailModal) orderDetailModal.style.display = "none";
  };
  
  if (closeOrderDetailModal) {
    closeOrderDetailModal.addEventListener("click", closeOrderDetailModalFunc);
  }
  
  if (orderDetailModal) {
    orderDetailModal.addEventListener("click", (e) => {
      if (e.target === orderDetailModal) closeOrderDetailModalFunc();
    });
  }
  
  if (printOrderDetailBtn) {
    printOrderDetailBtn.addEventListener("click", () => {
      window.print();
    });
  }
  
  if (cancelOrderDetailBtn) {
    cancelOrderDetailBtn.addEventListener("click", () => {
      const orderCode = orderDetailModal?.dataset.orderCode;
      if (orderCode && confirm(`Bạn có chắc chắn muốn hủy đơn hàng ${orderCode}?`)) {
        const idx = ordersSeed.findIndex((x) => x.code === orderCode);
        if (idx >= 0) {
          ordersSeed[idx].status = "canceled";
          // Lưu vào localStorage khi thay đổi trạng thái
          saveOrdersToStorage(ordersSeed);
          closeOrderDetailModalFunc();
          render();
        }
      }
    });
  }
  
  if (confirmOrderDetailBtn) {
    confirmOrderDetailBtn.addEventListener("click", () => {
      const orderCode = orderDetailModal?.dataset.orderCode;
      if (orderCode) {
        const idx = ordersSeed.findIndex((x) => x.code === orderCode);
        if (idx >= 0 && ordersSeed[idx].status === "pending") {
          ordersSeed[idx].status = "processing";
          // Lưu vào localStorage khi thay đổi trạng thái
          saveOrdersToStorage(ordersSeed);
          closeOrderDetailModalFunc();
          render();
        }
      }
    });
  }
  
  // Expose function globally
  window.openOrderDetailModal = openOrderDetailModal;
  
  // Expose render function sau khi đã định nghĩa
  window.orderRender = render;

  // ========= First render =========
  render();
});

// ========= Export to Excel =========
function exportOrdersToExcel() {
  // Lấy dữ liệu đơn hàng hiện tại (đã filter)
  const orders = getCurrentFilteredOrders();
  
  if (orders.length === 0) {
    alert("Không có đơn hàng nào để xuất!");
    return;
  }

  const formatMoney = window.formatMoney || ((v) => {
    try {
      return Number(v).toLocaleString("vi-VN") + "₫";
    } catch {
      return v + "₫";
    }
  });
  
  const formatDateTime = window.formatDateTime || ((d) => {
    const date = new Date(d);
    const pad2 = (n) => String(n).padStart(2, "0");
    return `${pad2(date.getHours())}:${pad2(date.getMinutes())} ${pad2(
      date.getDate()
    )}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
  });
  
  const statusMeta = window.statusMeta || {
    pending: { text: "Chờ xác nhận" },
    processing: { text: "Đang xử lý" },
    shipping: { text: "Đang giao" },
    completed: { text: "Đã giao" },
    canceled: { text: "Đã hủy" },
  };

  // Tạo CSV content
  let csvContent = "\uFEFF"; // BOM cho UTF-8
  csvContent += "Mã đơn,Khách hàng,Số điện thoại,Sản phẩm,Tổng tiền,Phương thức thanh toán,Đã thanh toán,Trạng thái,Thời gian\n";
  
  // Lấy danh sách sản phẩm từ localStorage để map với đơn hàng
  const allProducts = JSON.parse(localStorage.getItem("products") || "[]");
  
  orders.forEach(order => {
    const customerName = order.customer?.name || "";
    const customerPhone = order.customer?.phone || "";
    const products = order.products?.map(p => {
      // Tìm sản phẩm trong localStorage
      let productFromStore = null;
      if (p.productId) {
        productFromStore = allProducts.find(prod => prod.id === p.productId || prod.sku === p.productId);
      }
      if (!productFromStore && p.name) {
        productFromStore = allProducts.find(prod => prod.name === p.name);
      }
      return productFromStore?.name || p.name || p.emoji || "";
    }).join(", ") || "";
    const total = formatMoney(order.total || 0);
    const paymentMethod = order.payment?.method || "";
    const paid = order.payment?.paid ? "Có" : "Chưa";
    const status = statusMeta[order.status]?.text || order.status;
    const dateTime = formatDateTime(order.createdAt);
    
    csvContent += `"${order.code}","${customerName}","${customerPhone}","${products}","${total}","${paymentMethod}","${paid}","${status}","${dateTime}"\n`;
  });

  // Tạo và download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `don_hang_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  alert(`Đã xuất ${orders.length} đơn hàng thành công!`);
}

// ========= Print Orders =========
function printOrders() {
  const orders = getCurrentFilteredOrders();
  
  if (orders.length === 0) {
    alert("Không có đơn hàng nào để in!");
    return;
  }

  const formatMoney = window.formatMoney || ((v) => {
    try {
      return Number(v).toLocaleString("vi-VN") + "₫";
    } catch {
      return v + "₫";
    }
  });
  
  const formatDateTime = window.formatDateTime || ((d) => {
    const date = new Date(d);
    const pad2 = (n) => String(n).padStart(2, "0");
    return `${pad2(date.getHours())}:${pad2(date.getMinutes())} ${pad2(
      date.getDate()
    )}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
  });
  
  const statusMeta = window.statusMeta || {
    pending: { text: "Chờ xác nhận" },
    processing: { text: "Đang xử lý" },
    shipping: { text: "Đang giao" },
    completed: { text: "Đã giao" },
    canceled: { text: "Đã hủy" },
  };

  // Tạo nội dung in
  let printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Danh sách đơn hàng</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { text-align: center; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>Danh sách đơn hàng</h1>
      <p>Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</p>
      <p>Tổng số đơn: ${orders.length}</p>
      <table>
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>Số điện thoại</th>
            <th>Sản phẩm</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Thời gian</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  // Lấy danh sách sản phẩm từ localStorage để map với đơn hàng
  const allProducts = JSON.parse(localStorage.getItem("products") || "[]");
  
  orders.forEach(order => {
    const customerName = order.customer?.name || "";
    const customerPhone = order.customer?.phone || "";
    const products = order.products?.map(p => {
      // Tìm sản phẩm trong localStorage
      let productFromStore = null;
      if (p.productId) {
        productFromStore = allProducts.find(prod => prod.id === p.productId || prod.sku === p.productId);
      }
      if (!productFromStore && p.name) {
        productFromStore = allProducts.find(prod => prod.name === p.name);
      }
      return productFromStore?.name || p.name || p.emoji || "";
    }).join(", ") || "";
    const total = formatMoney(order.total || 0);
    const status = statusMeta[order.status]?.text || order.status;
    const dateTime = formatDateTime(order.createdAt);
    
    printContent += `
      <tr>
        <td>${order.code}</td>
        <td>${customerName}</td>
        <td>${customerPhone}</td>
        <td>${(() => {
          // Lấy tên sản phẩm từ localStorage
          const allProducts = JSON.parse(localStorage.getItem("products") || "[]");
          return order.products?.map(p => {
            let productFromStore = null;
            if (p.productId) {
              productFromStore = allProducts.find(prod => prod.id === p.productId || prod.sku === p.productId);
            }
            if (!productFromStore && p.name) {
              productFromStore = allProducts.find(prod => prod.name === p.name);
            }
            return productFromStore?.name || p.name || p.emoji || "";
          }).join(", ") || "";
        })()}</td>
        <td>${total}</td>
        <td>${status}</td>
        <td>${dateTime}</td>
      </tr>
    `;
  });
  
  printContent += `
        </tbody>
      </table>
    </body>
    </html>
  `;

  // Mở cửa sổ in
  const printWindow = window.open("", "_blank");
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  
  // Đợi một chút để nội dung load xong rồi mới in
  setTimeout(() => {
    printWindow.print();
  }, 250);
}

// ========= Helper: Get current filtered orders =========
function getCurrentFilteredOrders() {
  const ordersSeed = window.ordersSeed || [];
  const state = window.orderState || { dateRange: "today", status: "all", search: "", customDateRange: null };
  
  // Helper function để check date range (tương tự inDateRange)
  const inDateRange = (iso, range, customDateRange) => {
    if (range === "all") return true;
    if (!iso) return false;

    const d = new Date(iso);
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfDay = (x) => {
      const t = new Date(x);
      t.setHours(0, 0, 0, 0);
      return t;
    };

    if (range === "today") {
      return startOfDay(d).getTime() === startOfToday.getTime();
    }

    if (range === "yesterday") {
      const yesterday = new Date(startOfToday);
      yesterday.setDate(yesterday.getDate() - 1);
      return startOfDay(d).getTime() === yesterday.getTime();
    }

    if (range === "custom" && customDateRange) {
      const orderDate = startOfDay(d);
      const startDate = new Date(customDateRange.start);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(customDateRange.end);
      endDate.setHours(23, 59, 59, 999);
      return orderDate >= startDate && orderDate <= endDate;
    }

    const diffMs = now.getTime() - d.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (range === "7days") return diffDays <= 7;
    if (range === "30days") return diffDays <= 30;

    return true;
  };
  
  // Helper function để apply search (tương tự applySearch)
  const applySearch = (o, q) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      o.code?.toLowerCase().includes(s) ||
      o.customer?.name?.toLowerCase().includes(s) ||
      o.customer?.phone?.includes(s)
    );
  };
  
  // Filter theo date range và search
  // Đồng bộ sản phẩm từ localStorage trước khi export
  const syncedOrdersForExport = syncProductsFromStore(ordersSeed);
  let filtered = syncedOrdersForExport.filter(
    (o) => inDateRange(o.createdAt, state.dateRange, state.customDateRange) && applySearch(o, state.search)
  );
  
  // Filter theo status
  if (state.status !== "all") {
    filtered = filtered.filter(o => o.status === state.status);
  }
  
  return filtered;
}
