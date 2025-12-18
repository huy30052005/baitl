// Quản lý trạng thái cửa hàng trên tất cả các trang - SellerHub
document.addEventListener("DOMContentLoaded", () => {
  const STORE_STORAGE_KEY = "storeSettings";
  
  // Cập nhật nút trạng thái cửa hàng
  updateStoreStatusButton();
  
  // Lắng nghe thay đổi từ localStorage (khi thay đổi từ trang khác)
  window.addEventListener('storage', (e) => {
    if (e.key === STORE_STORAGE_KEY) {
      updateStoreStatusButton();
    }
  });
  
  // Cũng lắng nghe custom event (khi thay đổi trong cùng tab)
  window.addEventListener('storeStatusChanged', () => {
    updateStoreStatusButton();
  });
  
  function updateStoreStatusButton() {
    try {
      const stored = localStorage.getItem(STORE_STORAGE_KEY);
      let isOpen = true; // Mặc định là mở
      
      if (stored) {
        const storeData = JSON.parse(stored);
        isOpen = storeData.isOpen !== false;
      }
      
      // Tìm tất cả các nút "Cửa hàng đang mở" trên trang
      const storeButtons = document.querySelectorAll('.btn-store-open');
      
      storeButtons.forEach(btn => {
        if (isOpen) {
          btn.textContent = 'Cửa hàng đang mở';
          btn.classList.remove('btn-store-closed');
          btn.classList.add('btn-store-open');
        } else {
          btn.textContent = 'Cửa hàng đã đóng';
          btn.classList.remove('btn-store-open');
          btn.classList.add('btn-store-closed');
        }
      });
    } catch (e) {
      console.error('Lỗi khi cập nhật trạng thái cửa hàng:', e);
    }
  }
});

