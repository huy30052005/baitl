// Product management JavaScript

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const itemsPerPage = 10;

document.addEventListener("DOMContentLoaded", () => {
  const btnAddProduct = document.querySelector(".btn-add");
  const modal = document.getElementById("productModal");
  const closeModal = document.querySelector(".modal-close");
  const cancelBtn = document.querySelector(".btn-cancel");
  const productForm = document.getElementById("productForm");
  const imageUpload = document.getElementById("imageUpload");
  const imagePreview = document.getElementById("imagePreview");
  const imagePreviewImg = document.getElementById("imagePreviewImg");
  const searchInput = document.querySelector(".search-input");
  const categoryFilter = document.querySelectorAll(".filter-select")[0];
  const statusFilter = document.querySelectorAll(".filter-select")[1];

  // Load all products
  loadAllProducts();

  // Open modal
  if (btnAddProduct) {
    btnAddProduct.addEventListener("click", () => {
      modal.style.display = "flex";
    });
  }

  // Close modal
  const closeModalFunc = () => {
    modal.style.display = "none";
    productForm.reset();
    imagePreview.style.display = "none";
  };

  if (closeModal) closeModal.addEventListener("click", closeModalFunc);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModalFunc);

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModalFunc();
    }
  });

  // Image upload preview
  if (imageUpload) {
    imageUpload.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          imagePreviewImg.src = e.target.result;
          imagePreview.style.display = "block";
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Form submit
  if (productForm) {
    productForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Get form data
      const formData = new FormData(productForm);
      const quantity = parseInt(formData.get("quantity"));

      let status = "success";
      let statusText = "Đang bán";

      if (quantity <= 5) {
        status = "pending";
        statusText = "Sắp hết";
      }
      if (quantity === 0) {
        status = "cancelled";
        statusText = "Hết hàng";
      }

      const product = {
        name: formData.get("productName"),
        sku: formData.get("sku") || "N/A",
        category: formData.get("category"),
        price: formData.get("price"),
        originalPrice: formData.get("originalPrice") || formData.get("price"),
        quantity: quantity,
        description: formData.get("description"),
        image: imagePreviewImg.src || "https://via.placeholder.com/40",
        sold: 0,
        status: status,
        statusText: statusText,
      };

      // Get existing products from localStorage
      let products = JSON.parse(localStorage.getItem("products") || "[]");
      products.push(product);
      localStorage.setItem("products", JSON.stringify(products));

      // Calculate which page the new product will be on
      const totalProducts = products.length;
      const newProductPage = Math.ceil(totalProducts / itemsPerPage);

      // Set current page to the page with the new product
      currentPage = newProductPage;

      // Reload all products
      loadAllProducts();

      // Close modal and reset form
      closeModalFunc();

      // Show success message
      alert("Thêm sản phẩm thành công!");
    });
  }

  // Search functionality
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      filterProducts();
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
});

function loadAllProducts() {
  // Get products from localStorage, default to empty array
  allProducts = JSON.parse(localStorage.getItem("products") || "[]");
  displayProducts(allProducts);
}

function displayProducts(products) {
  filteredProducts = products;
  const totalPages = Math.ceil(products.length / itemsPerPage) || 1;

  // Reset to page 1 if current page is out of range
  if (currentPage > totalPages) {
    currentPage = 1;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const tbody = document.querySelector("#productTable");
  if (!tbody) return;

  tbody.innerHTML = "";

  // Show message if no products
  if (products.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-muted);">
        <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
        <div style="font-size: 16px; margin-bottom: 8px;">Chưa có sản phẩm nào</div>
        <div style="font-size: 14px;">Nhấn "Thêm sản phẩm mới" để bắt đầu</div>
      </td>
    `;
    tbody.appendChild(tr);

    // Fill remaining rows
    for (let i = 1; i < itemsPerPage; i++) {
      const emptyTr = document.createElement("tr");
      emptyTr.className = "empty-row";
      emptyTr.innerHTML = `<td colspan="9">&nbsp;</td>`;
      tbody.appendChild(emptyTr);
    }
  } else {
    // Add actual products
    currentProducts.forEach((product, index) => {
      const globalIndex = startIndex + index + 1;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${globalIndex}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 10px">
            <img
              src="${product.image}"
              alt="Product"
              style="width: 40px; height: 40px; border-radius: 5px; object-fit: cover;"
              onerror="this.src='https://via.placeholder.com/40'"
            />
            <span>${product.name}</span>
          </div>
        </td>
        <td>${product.sku}</td>
        <td>${product.category}</td>
        <td>${formatPrice(product.price)}</td>
        <td>${product.quantity}</td>
        <td>${product.sold}</td>
        <td><span class="status ${product.status}">${
        product.statusText
      }</span></td>
        <td>...</td>
      `;
      tbody.appendChild(tr);
    });

    // Fill remaining rows to make table full height
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

  let paginationHTML = `<span>Trang ${currentPage} / ${totalPages}</span>`;

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
  // Format giá theo tiền Việt Nam (VND)
  // Ví dụ: 1000000 -> "1.000.000 ₫"
  try {
    const numPrice = parseFloat(price) || 0;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numPrice);
  } catch (error) {
    // Fallback format nếu Intl.NumberFormat không hỗ trợ
    const numPrice = parseFloat(price) || 0;
    return numPrice.toLocaleString("vi-VN").replace(/,/g, ".") + " ₫";
  }
}

// Reset products only
function resetAllData() {
  if (confirm("Bạn có chắc muốn xóa tất cả sản phẩm?")) {
    localStorage.removeItem("products");
    currentPage = 1;
    loadAllProducts();
  }
}
