// Action Menu Handler - Dùng chung cho tất cả các trang
document.addEventListener("DOMContentLoaded", () => {
  // Cache các menu đang mở để tránh query nhiều lần
  let openMenus = null;
  
  const getOpenMenus = () => {
    if (!openMenus || openMenus.length === 0) {
      openMenus = document.querySelectorAll(".action-menu.open");
    }
    return openMenus;
  };
  
  const closeAllMenus = () => {
    const menus = getOpenMenus();
    menus.forEach((m) => m.classList.remove("open"));
    openMenus = null; // Reset cache
  };
  
  // Xử lý click vào action toggle button
  document.addEventListener("click", (e) => {
    const toggle = e.target.closest(".action-toggle");
    const menu = e.target.closest(".action-menu");
    const item = e.target.closest(".action-item");

    // Click vào toggle button
    if (toggle && menu) {
      e.stopPropagation();
      const isOpen = menu.classList.contains("open");
      
      // Đóng tất cả các menu khác
      closeAllMenus();
      
      // Toggle menu hiện tại
      if (!isOpen) {
        menu.classList.add("open");
        openMenus = [menu]; // Update cache
      }
      return;
    }

    // Click vào action item
    if (item) {
      e.stopPropagation();
      e.preventDefault();
      
      const menu = item.closest(".action-menu");
      if (menu) {
        menu.classList.remove("open");
        openMenus = null; // Reset cache
      }
      
      const action = item.getAttribute("data-action");
      if (action) {
        // Xử lý action ở đây nếu cần
        console.log("Action clicked:", action);
      }
      return;
    }

    // Click bên ngoài -> đóng tất cả menu
    if (!e.target.closest(".action-menu")) {
      closeAllMenus();
    }
  });
});
















