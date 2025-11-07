// Auth Guard - Kiểm tra đăng nhập
(function () {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const currentPage = window.location.pathname.split("/").pop();

  // Danh sách trang không cần đăng nhập
  const publicPages = [
    "login.html",
    "signup.html",
    "reset-password.html",
    "index.html",
  ];

  // Nếu chưa đăng nhập và không phải trang public
  if (!isLoggedIn && !publicPages.includes(currentPage)) {
    window.location.href = "login.html";
  }

  // Nếu đã đăng nhập mà vào trang login/signup → redirect đến dashboard
  if (
    isLoggedIn &&
    (currentPage === "login.html" || currentPage === "signup.html")
  ) {
    window.location.href = "product-list (1).html";
  }
})();

// Hàm logout
function logout() {
  if (confirm("Bạn có chắc muốn đăng xuất?")) {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    window.location.href = "login.html";
  }
}

// Hiển thị thông tin user trong sidebar
document.addEventListener("DOMContentLoaded", function () {
  const userNameElement = document.querySelector(
    '.user div[style*="font-weight:700"]'
  );
  const userName = localStorage.getItem("userName") || "Admin";

  if (userNameElement) {
    userNameElement.textContent = userName;
  }
});

// --- ROUTING NHẸ GIỮA LIST <-> REGISTER ---
function setSubmenuActive(route) {
  // bỏ active cứng trên "Danh sách" nếu bạn dùng auto-active theo URL thì giữ như cũ
  document
    .querySelectorAll(".submenu a")
    .forEach((a) => a.classList.remove("active"));
  if (route === "list") {
    const a = document.querySelector('.submenu a[href="product-list.html"]');
    if (a) a.classList.add("active");
    document.querySelector(".title").textContent = "DANH SÁCH SẢN PHẨM";
  } else if (route === "register") {
    const a = document.querySelector('.submenu a[data-route="register"]');
    if (a) a.classList.add("active");
    document.querySelector(".title").textContent = "ĐĂNG KÝ NGƯỜI BÁN";
  }
}

function showRoute(route) {
  const listCard = document.getElementById("listCard");
  const regCard = document.getElementById("registerCard");
  if (route === "register") {
    listCard.style.display = "none";
    regCard.style.display = "";
  } else {
    listCard.style.display = "";
    regCard.style.display = "none";
  }
  setSubmenuActive(route);
  localStorage.setItem("larkonRoute", route);
}

// click vào link "Đăng ký"
document
  .querySelector('.submenu a[data-route="register"]')
  ?.addEventListener("click", (e) => {
    e.preventDefault();
    showRoute("register");
  });

// nút trở về
document
  .getElementById("btnBackToList")
  ?.addEventListener("click", () => showRoute("list"));

// khởi động theo route đã lưu (mặc định là list)
showRoute(localStorage.getItem("larkonRoute") || "list");

// submit form mô phỏng
function submitRegisterForm() {
  alert("Đã gửi hồ sơ đăng ký! Chờ Admin duyệt.");
  showRoute("list");
}
function toggleSubmenu(el) {
  const item = el.closest(".nav-item");
  const isOpen = item.classList.contains("open");

  // Thu tất cả
  document
    .querySelectorAll(".nav .nav-item")
    .forEach((i) => i.classList.remove("open"));

  // Nếu nhóm chưa mở thì mở; nếu đang mở thì để thu lại (không thêm lại 'open')
  if (!isOpen) item.classList.add("open");
}
const products = [
  {
    id: 1,
    name: "Áo thun đen",
    sizes: "S, M, L, Xl",
    price: 80,
    stock: 466,
    category: "Thời trang",
    rating: 4.5,
    reviews: 55,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100",
  },
  {
    id: 2,
    name: "Túi da màu xanh ổ liu",
    sizes: "S, M",
    price: 136,
    stock: 784,
    category: "Túi xách tay",
    rating: 4.1,
    reviews: 143,
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=100",
  },
  {
    id: 3,
    name: "Phụ nữ vàng Dress",
    sizes: "S, M",
    price: 219,
    stock: 769,
    category: "Thời trang",
    rating: 4.4,
    reviews: 174,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100",
  },
  {
    id: 4,
    name: "Mũ Xám Cho Nam",
    sizes: "S, M, L",
    price: 76,
    stock: 571,
    category: "Mũ lưỡi trai",
    rating: 4.2,
    reviews: 23,
    image: "https://images.unsplash.com/photo-1588099768523-f4e6a5679d88?w=100",
  },
  {
    id: 5,
    name: "Pent chờ hàng màu xanh đậm",
    sizes: "S, M, L, Xl",
    price: 110,
    stock: 241,
    category: "Thời trang",
    rating: 4.4,
    reviews: 109,
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=100",
  },
  {
    id: 6,
    name: "Tai nghe đa màu cam",
    sizes: "S, M",
    price: 231,
    stock: 821,
    category: "Điện tử",
    rating: 4.2,
    reviews: 200,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100",
  },
  {
    id: 7,
    name: "Giày Kid's Yellow",
    sizes: "18, 19, 20, 21",
    price: 89,
    stock: 321,
    category: "Giày",
    rating: 4.5,
    reviews: 321,
    image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=100",
  },
  {
    id: 8,
    name: "Ví Nam Màu Nâu Đen",
    sizes: "S, M",
    price: 132,
    stock: 190,
    category: "Ví",
    rating: 4.1,
    reviews: 190,
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=100",
  },
  {
    id: 9,
    name: "Kính rầm Sky Blue",
    sizes: "S, M",
    price: 77,
    stock: 784,
    category: "Kính rầm",
    rating: 3.5,
    reviews: 298,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100",
  },
  {
    id: 10,
    name: "Áo thun màu vàng của trẻ em",
    sizes: "S",
    price: 110,
    stock: 650,
    category: "Thời trang",
    rating: 4.1,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=100",
  },
];

let currentPage = 1,
  itemsPerPage = 10,
  filteredProducts = [...products];

function renderProducts() {
  const tbody = document.getElementById("productTableBody");
  const start = (currentPage - 1) * itemsPerPage,
    end = start + itemsPerPage;
  const pageProducts = filteredProducts.slice(start, end);
  tbody.innerHTML = pageProducts
    .map(
      (p) => `
          <tr>
            <td><input type="checkbox" /></td>
            <td><div class="product"><div class="thumb"><img src="${
              p.image
            }" alt="${p.name}"/></div><div><div class="name">${
        p.name
      }</div><div class="sub">Kích thước: ${p.sizes}</div></div></div></td>
            <td>$${p.price.toFixed(2)}</td>
            <td><div>${p.stock} Mục Trái</div><div class="sub">${Math.floor(
        p.stock / 10
      )} Đã bán</div></td>
            <td>${p.category}</td>
            <td><div class="rating"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style="color:#fbbf24"><polygon points="12 2 15 8 22 9 17 14 18 21 12 18 6 21 7 14 2 9 9 8"/></svg>${
              p.rating
            }</div><div class="sub">${p.reviews} Đánh giá</div></td>
            <td><div class="act"><div class="pill view" title="Xem" onclick="window.location.href='product-details.html'">👁️</div><div class="pill edit" title="Sửa" onclick="window.location.href='product-edit.html'">✏️</div><div class="pill del" title="Xóa" onclick="deleteProduct(${
              p.id
            })">🗑️</div></div></td>
          </tr>`
    )
    .join("");
  renderPagination();
  updatePageInfo();
}

function renderPagination() {
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const pagination = document.getElementById("pagination");
  let html = `<button onclick="changePage(${currentPage - 1})" ${
    currentPage === 1 ? "disabled" : ""
  }>Trước</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button ${
      i === currentPage
        ? "style='background:var(--accent);font-weight:700'"
        : ""
    } onclick="changePage(${i})">${i}</button>`;
  }
  html += `<button onclick="changePage(${currentPage + 1})" ${
    currentPage === totalPages ? "disabled" : ""
  }>Tiếp</button>`;
  pagination.innerHTML = html;
}

function changePage(p) {
  const total = Math.ceil(filteredProducts.length / itemsPerPage);
  if (p < 1 || p > total) return;
  currentPage = p;
  renderProducts();
}
function updatePageInfo() {
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, filteredProducts.length);
  document.getElementById(
    "pageInfo"
  ).textContent = `Hiển thị ${start}-${end} trong ${filteredProducts.length} kết quả`;
}
document.getElementById("searchInput").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  );
  currentPage = 1;
  renderProducts();
});
document.getElementById("selectAll").addEventListener("change", function () {
  document
    .querySelectorAll('tbody input[type="checkbox"]')
    .forEach((cb) => (cb.checked = this.checked));
});
function deleteProduct(id) {
  if (confirm("Xóa sản phẩm này?")) {
    const i = products.findIndex((p) => p.id === id);
    if (i > -1) {
      products.splice(i, 1);
      filteredProducts = [...products];
      renderProducts();
    }
  }
}
function toggleSidebar() {
  document.querySelector(".layout").classList.toggle("collapsed");
  localStorage.setItem(
    "sidebarCollapsed",
    document.querySelector(".layout").classList.contains("collapsed")
  );
}
if (localStorage.getItem("sidebarCollapsed") === "true") {
  document.querySelector(".layout").classList.add("collapsed");
}
function toggleSubmenu(el) {
  el.parentElement.classList.toggle("open");
}
renderProducts();
document.addEventListener("DOMContentLoaded", function () {
  function setSubmenuActive(route) {
    document
      .querySelectorAll("#submenu a")
      .forEach((a) => a.classList.remove("active"));
    if (route === "register") {
      document
        .querySelector('#submenu a[data-route="register"]')
        ?.classList.add("active");
      document.querySelector(".title").textContent = "ĐĂNG KÝ NGƯỜI BÁN";
    } else {
      document
        .querySelector('#submenu a[href="product-list.html"]')
        ?.classList.add("active");
      document.querySelector(".title").textContent = "DANH SÁCH SẢN PHẨM";
    }
  }

  function showRoute(route) {
    const list = document.getElementById("listCard");
    const reg = document.getElementById("registerCard");
    if (!list || !reg) return; // thiếu card -> không làm gì

    if (route === "register") {
      list.style.display = "none";
      reg.style.display = "";
    } else {
      list.style.display = "";
      reg.style.display = "none";
    }
    setSubmenuActive(route);
    localStorage.setItem("larkonRoute", route);
  }
  window.showRoute = showRoute; // cho phép gọi từ inline onclick nếu cần

  // BẮT CLICK TRÊN TOÀN SUBMENU (event delegation, không sợ phần tử chưa sẵn sàng)
  document.getElementById("submenu")?.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-route]");
    if (!a) return;
    e.preventDefault();
    const route = a.dataset.route;
    if (route === "register") showRoute("register");
  });

  document
    .getElementById("btnBackToList")
    ?.addEventListener("click", () => showRoute("list"));

  // Khởi động theo route lưu trước (mặc định list)
  showRoute(localStorage.getItem("larkonRoute") || "list");

  // Submit mô phỏng
  window.submitRegisterForm = function () {
    alert("Đã gửi hồ sơ đăng ký! Vui lòng chờ Admin duyệt.");
    showRoute("list");
  };
});
function toggleSubmenu(el) {
  const item = el.closest(".nav-item");
  const isOpen = item.classList.contains("open");
  document
    .querySelectorAll(".nav .nav-item")
    .forEach((i) => i.classList.remove("open"));
  if (!isOpen) item.classList.add("open");
}

// Hiển thị panel theo route
function showRoute(route) {
  const list = document.getElementById("listCard");
  const reg = document.getElementById("registerCard");
  if (!list || !reg) return;

  if (route === "register") {
    list.style.display = "none";
    reg.style.display = "";
    document.querySelector(".title").textContent = "ĐĂNG KÝ NGƯỜI BÁN";

    // active top-level
    document
      .querySelectorAll("#submenu a")
      .forEach((a) => a.classList.remove("active"));
    document
      .querySelectorAll(".nav a[data-top]")
      .forEach((a) => a.classList.remove("active"));
    document
      .querySelector('.nav a[data-top="register"]')
      ?.classList.add("active");

    // không ảnh hưởng trạng thái mở/thu của "Sản phẩm"
  } else {
    list.style.display = "";
    reg.style.display = "none";
    document.querySelector(".title").textContent = "DANH SÁCH SẢN PHẨM";

    // active mặc định cho “Danh sách”
    document
      .querySelectorAll(".nav a[data-top]")
      .forEach((a) => a.classList.remove("active"));
    document.getElementById("navProducts")?.classList.add("open");
    document
      .querySelectorAll("#submenu a")
      .forEach((a) => a.classList.remove("active"));
    document
      .querySelector('#submenu a[href="product-list.html"]')
      ?.classList.add("active");
  }
  localStorage.setItem("larkonRoute", route);
}
window.showRoute = showRoute;

// Click top-level “Đăng ký”
document
  .querySelector('.nav a[data-top="register"]')
  ?.addEventListener("click", (e) => {
    e.preventDefault();
    showRoute("register");
  });

// Khi bấm item con của Sản phẩm → quay về list (demo)
document.getElementById("submenu")?.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (a) {
    showRoute("list");
  }
});

// Khởi động
showRoute(localStorage.getItem("larkonRoute") || "list");
