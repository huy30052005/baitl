document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("revenueChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  // Kích thước
  const width = (canvas.width = canvas.offsetWidth);
  const height = (canvas.height = canvas.offsetHeight);

  // Dữ liệu giả
  const points = [30, 40, 35, 45, 60, 55, 70, 80, 78, 90, 95, 100];

  // Vẽ trục
  ctx.strokeStyle = "#1f2933";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(30, 10);
  ctx.lineTo(30, height - 20);
  ctx.lineTo(width - 10, height - 20);
  ctx.stroke();

  // Vẽ đường
  const maxVal = Math.max(...points);
  const minVal = Math.min(...points);
  const chartH = height - 40;
  const chartW = width - 50;
  const stepX = chartW / (points.length - 1);

  const scaleY = (v) =>
    height - 20 - ((v - minVal) / (maxVal - minVal || 1)) * chartH;

  ctx.beginPath();
  ctx.lineWidth = 2;
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, "#22c55e");
  gradient.addColorStop(1, "#4ade80");
  ctx.strokeStyle = gradient;

  points.forEach((val, idx) => {
    const x = 30 + idx * stepX;
    const y = scaleY(val);
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Vẽ vùng fill dưới đường
  ctx.lineTo(30 + (points.length - 1) * stepX, height - 20);
  ctx.lineTo(30, height - 20);
  ctx.closePath();
  const fillGradient = ctx.createLinearGradient(0, 0, 0, height);
  fillGradient.addColorStop(0, "rgba(34, 197, 94, 0.25)");
  fillGradient.addColorStop(1, "rgba(15, 23, 42, 0)");
  ctx.fillStyle = fillGradient;
  ctx.fill();
});

// Navigation between pages
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", function (e) {
      const page = this.getAttribute("data-page");

      // Only handle pages with data-page attribute
      if (!page) return;

      e.preventDefault();

      // Remove active class from all items
      document
        .querySelectorAll(".nav-item")
        .forEach((nav) => nav.classList.remove("active"));

      // Add active class to clicked item
      this.classList.add("active");

      // Hide all content sections
      const tongquanContent = document.getElementById("tongquanContent");
      const pageTitle = document.getElementById("pageTitle");
      const searchInput = document.getElementById("searchInput");

      if (tongquanContent) tongquanContent.style.display = "none";

      // Show selected content
      if (page === "tongquan") {
        if (tongquanContent) tongquanContent.style.display = "block";
        if (pageTitle) pageTitle.textContent = "Tổng quan";
        if (searchInput)
          searchInput.placeholder = "Tìm kiếm đơn hàng, khách hàng...";
      }
    });
  });
});
