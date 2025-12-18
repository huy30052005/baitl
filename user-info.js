// User info management - Simple version that doesn't redirect

document.addEventListener("DOMContentLoaded", () => {
  updateUserInfo();
  setupUserDropdown();
});

function updateUserInfo() {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  if (userInfo.username) {
    // Update user name
    const userNameElements = document.querySelectorAll(".user-name");
    userNameElements.forEach((element) => {
      element.textContent = userInfo.displayName || userInfo.username;
    });

    // Update avatar - tìm tất cả các span trong .avatar
    const avatarElements = document.querySelectorAll(".avatar span");
    avatarElements.forEach((element) => {
      element.textContent = userInfo.avatar || "U";
    });

    // Update user circle button (nút ở topbar)
    const userCircleElements = document.querySelectorAll(".user-circle");
    userCircleElements.forEach((element) => {
      element.textContent = userInfo.avatar || "U";
    });
  } else {
    // Nếu chưa đăng nhập, có thể chuyển về trang login (tùy chọn)
    // Nhưng theo yêu cầu, không redirect nên để trống
  }
}

function logout() {
  localStorage.removeItem("userInfo");
  localStorage.removeItem("isLoggedIn");
  window.location.href = "login.html";
}

// ========== SETUP USER DROPDOWN MENU ==========
function setupUserDropdown() {
  const userElements = document.querySelectorAll(".sidebar-footer .user");
  
  userElements.forEach((userElement) => {
    // Kiểm tra xem đã có dropdown chưa
    const sidebarFooter = userElement.closest(".sidebar-footer");
    if (!sidebarFooter) return;
    
    if (sidebarFooter.querySelector(".user-dropdown")) {
      return; // Đã có dropdown rồi
    }

    // Tạo dropdown menu
    const dropdown = document.createElement("div");
    dropdown.className = "user-dropdown";

    // Lấy thông tin user
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const userName = userInfo.displayName || userInfo.username || "Nguyễn Hoàng";
    const userRole = userInfo.role || "Premium Seller";
    const userAvatar = userInfo.avatar || "NH";

    dropdown.innerHTML = `
      <div style="padding: 12px; border-bottom: 1px solid var(--border);">
        <button class="logout-btn">
          <span style="font-size: 16px;">🚪</span>
          <span>Đăng xuất</span>
        </button>
      </div>
      <div style="padding: 12px; display: flex; align-items: center; gap: 12px;">
        <div class="avatar" style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px;">
          <span>${userAvatar}</span>
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 14px; color: var(--text);">${userName}</div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">${userRole}</div>
        </div>
        <span style="color: var(--text-muted); font-size: 12px;">▾</span>
      </div>
    `;

    // Thêm dropdown vào sidebar-footer
    sidebarFooter.appendChild(dropdown);

    // Thêm event listener cho nút đăng xuất
    const logoutBtn = dropdown.querySelector(".logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        logout();
      });
    }

    // Toggle dropdown khi click vào user element
    userElement.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains("show");
      
      // Đóng tất cả dropdown khác
      document.querySelectorAll(".user-dropdown").forEach((dd) => {
        if (dd !== dropdown) {
          dd.classList.remove("show");
        }
      });

      // Toggle dropdown hiện tại
      if (isOpen) {
        dropdown.classList.remove("show");
      } else {
        dropdown.classList.add("show");
      }
    });

    // Đóng dropdown khi click bên ngoài
    document.addEventListener("click", (e) => {
      if (!userElement.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove("show");
      }
    });
  });
}
