// Đảm bảo các mục sidebar luôn hiển thị, không bị ẩn khi click
document.addEventListener("DOMContentLoaded", () => {
  // Cache các elements để tránh query nhiều lần
  let cachedNavItems = null;
  let cachedSectionLabels = null;
  let cachedNavContainers = null;
  
  // Hàm để cache lại elements (chỉ khi cần)
  const refreshCache = () => {
    cachedNavItems = document.querySelectorAll(".nav-item");
    cachedSectionLabels = document.querySelectorAll(".sidebar-section-label");
    cachedNavContainers = document.querySelectorAll(".sidebar-nav");
  };
  
  // Đảm bảo tất cả các nav-item luôn hiển thị
  const ensureNavItemsVisible = () => {
    // Chỉ refresh cache nếu chưa có hoặc khi cần
    if (!cachedNavItems || cachedNavItems.length === 0) {
      refreshCache();
    }
    
    // Kiểm tra và sửa các nav-item
    if (cachedNavItems) {
      cachedNavItems.forEach((item) => {
        if (item.style.display === "none") {
          item.style.display = "";
        }
        item.classList.remove("hidden", "hide");
      });
    }
    
    // Kiểm tra và sửa các section label
    if (cachedSectionLabels) {
      cachedSectionLabels.forEach((label) => {
        if (label.style.display === "none") {
          label.style.display = "";
        }
        label.classList.remove("hidden", "hide");
      });
    }
    
    // Kiểm tra và sửa các nav container
    if (cachedNavContainers) {
      cachedNavContainers.forEach((nav) => {
        if (nav.style.display === "none") {
          nav.style.display = "";
        }
        nav.classList.remove("hidden", "hide");
      });
    }
  };
  
  // Debounce function để tránh chạy quá nhiều lần
  let rafId = null;
  const debouncedEnsureVisible = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    rafId = requestAnimationFrame(() => {
      ensureNavItemsVisible();
      rafId = null;
    });
  };
  
  // Chạy ngay khi load
  refreshCache();
  ensureNavItemsVisible();
  
  // Chạy lại khi có thay đổi trong DOM (với debounce)
  const observer = new MutationObserver((mutations) => {
    // Chỉ xử lý nếu có thay đổi liên quan đến style hoặc class
    const hasRelevantChange = mutations.some(mutation => {
      if (mutation.type === 'attributes') {
        return mutation.attributeName === 'style' || mutation.attributeName === 'class';
      }
      if (mutation.type === 'childList') {
        // Refresh cache nếu có thêm/bớt element
        refreshCache();
        return true;
      }
      return false;
    });
    
    if (hasRelevantChange) {
      debouncedEnsureVisible();
    }
  });
  
  // Quan sát thay đổi trong sidebar (giới hạn scope)
  const sidebar = document.querySelector(".sidebar");
  if (sidebar) {
    observer.observe(sidebar, {
      childList: true,
      subtree: false, // Chỉ quan sát trực tiếp, không quan sát toàn bộ subtree
      attributes: true,
      attributeFilter: ["style", "class"]
    });
    
    // Quan sát riêng các nav container để phát hiện thay đổi trong đó
    const navContainers = document.querySelectorAll(".sidebar-nav");
    navContainers.forEach((nav) => {
      observer.observe(nav, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class"]
      });
    });
  }
  
  // Đảm bảo khi click vào nav-item, các mục khác không bị ẩn
  // Sử dụng event delegation thay vì addEventListener cho từng item
  const sidebarNav = document.querySelector(".sidebar-nav")?.parentElement || sidebar;
  if (sidebarNav) {
    sidebarNav.addEventListener("click", function(e) {
      const navItem = e.target.closest(".nav-item");
      if (navItem) {
        const hasDataPage = navItem.hasAttribute("data-page");
        if (!hasDataPage) {
          // Chỉ chạy một lần sau khi click, không cần setTimeout
          requestAnimationFrame(() => {
            ensureNavItemsVisible();
          });
        }
      }
    }, true); // Use capture phase để xử lý sớm hơn
  }
});







