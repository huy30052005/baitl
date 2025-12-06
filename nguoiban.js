document.addEventListener("DOMContentLoaded", function () {
  /* ====== ĐIỀU HƯỚNG SIDEBAR ====== */
  const mapTitle = {
    dashboard: "Tổng quan",
    products: "Sản phẩm",
    categories: "Danh mục",
    inventory: "Tồn kho",
    orders: "Đơn hàng",
    customers: "Khách hàng",
  };

  const pageTitle = document.querySelector(".page-title");
  const breadcrumb = document.querySelector(".breadcrumb-current");

  document.querySelectorAll(".sidebar-item[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = btn.dataset.page;

      // active sidebar
      document
        .querySelectorAll(".sidebar-item")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // show page
      document
        .querySelectorAll(".page")
        .forEach((p) => p.classList.remove("page-active"));
      const target = document.getElementById("page-" + page);
      if (target) target.classList.add("page-active");

      // update titles
      if (mapTitle[page]) {
        pageTitle.textContent = mapTitle[page];
        breadcrumb.textContent = mapTitle[page];
      }
    });
  });

  /* ====== CHART DOANH THU ====== */
  const ctx = document.getElementById("revenueChart");
  if (ctx && window.Chart) {
    new Chart(ctx, {
      type: "line",
      data: {
        labels: [
          "T1",
          "T2",
          "T3",
          "T4",
          "T5",
          "T6",
          "T7",
          "T8",
          "T9",
          "T10",
          "T11",
          "T12",
        ],
        datasets: [
          {
            data: [45, 50, 48, 60, 55, 70, 72, 78, 85, 90, 95, 100],
            borderColor: "#00ff90",
            backgroundColor: "rgba(0,255,144,0.15)",
            fill: true,
            borderWidth: 3,
            tension: 0.4,
            pointRadius: 0,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { color: "#9ca3af" },
            grid: { color: "#111827" },
          },
          y: {
            ticks: { color: "#9ca3af" },
            grid: { color: "#111827" },
          },
        },
      },
    });
  }

  /* ====== MODAL THÊM SẢN PHẨM ====== */
  const modal = document.getElementById("modal-add-product");
  if (modal) {
    const openBtns = document.querySelectorAll("[data-open-add-product]");
    const closeBtns = modal.querySelectorAll("[data-close-modal]");

    function openModal() {
      modal.classList.add("modal-open");
    }

    function closeModal() {
      modal.classList.remove("modal-open");
    }

    // mở
    openBtns.forEach((btn) => btn.addEventListener("click", openModal));

    // đóng
    closeBtns.forEach((btn) => btn.addEventListener("click", closeModal));

    // click nền đen để đóng
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    // ESC để đóng
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });

    // submit demo: chỉ đóng modal
    const form = modal.querySelector("form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        // sau này xử lý lưu sản phẩm ở đây
        closeModal();
      });
    }
  }
});
