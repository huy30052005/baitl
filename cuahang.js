// Quản lý cửa hàng - SellerHub
document.addEventListener("DOMContentLoaded", () => {
  const STORE_STORAGE_KEY = "storeSettings";
  
  // ========== KHỞI TẠO ==========
  initializeStorePage();
  
  // ========== TAB SWITCHING ==========
  setupTabSwitching();
  
  // ========== TOGGLE CỬA HÀNG ĐANG MỞ ==========
  setupStoreOpenToggle();
  
  // ========== UPLOAD ẢNH BÌA ==========
  setupCoverImageUpload();
  
  // ========== QUẢN LÝ GIỜ HOẠT ĐỘNG ==========
  setupOperatingHours();
  
  // ========== LƯU DỮ LIỆU ==========
  setupSaveButtons();
  
  // ========== HỦY THAY ĐỔI ==========
  setupCancelButtons();
  
  // ========== KHỞI TẠO TRANG ==========
  function initializeStorePage() {
    // Load dữ liệu từ localStorage
    const storeData = loadStoreData();
    
    // Cập nhật UI với dữ liệu đã lưu
    if (storeData) {
      updateUIFromData(storeData);
    } else {
      // Tạo dữ liệu mẫu
      const defaultData = getDefaultStoreData();
      saveStoreData(defaultData);
      updateUIFromData(defaultData);
    }
    
    // Cập nhật profile card
    updateStoreProfile();
  }
  
  // ========== LOAD DỮ LIỆU ==========
  function loadStoreData() {
    try {
      const stored = localStorage.getItem(STORE_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Lỗi khi đọc dữ liệu cửa hàng:', e);
    }
    return null;
  }
  
  // ========== LƯU DỮ LIỆU ==========
  function saveStoreData(data) {
    try {
      localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Lỗi khi lưu dữ liệu cửa hàng:', e);
      return false;
    }
  }
  
  // ========== DỮ LIỆU MẪU ==========
  function getDefaultStoreData() {
    return {
      // Thông tin chung
      name: "TechStore Official",
      slug: "techstore-official",
      description: "Chuyên cung cấp các sản phẩm công nghệ chính hãng Apple, Samsung, Sony với giá tốt nhất thị trường. Cam kết 100% hàng chính hãng, bảo hành đầy đủ.",
      category: "electronics",
      taxId: "0123456789",
      coverImage: null,
      
      // Liên hệ
      phone: "0912 345 678",
      email: "contact@techstore.com",
      website: "https://techstore.com.vn",
      address: "123 Nguyễn Văn Linh, Phường Tân Phong",
      ward: "tan-phong",
      district: "quan-7",
      city: "hcm",
      
      // Giờ hoạt động
      showHours: true,
      operatingHours: {
        monday: { enabled: true, open: "08:00", close: "21:00" },
        tuesday: { enabled: true, open: "08:00", close: "21:00" },
        wednesday: { enabled: true, open: "08:00", close: "21:00" },
        thursday: { enabled: true, open: "08:00", close: "21:00" },
        friday: { enabled: true, open: "08:00", close: "21:00" },
        saturday: { enabled: true, open: "09:00", close: "20:00" },
        sunday: { enabled: false, open: "09:00", close: "20:00" }
      },
      
      // Mạng xã hội
      social: {
        facebook: "https://facebook.com/techstore.official",
        instagram: "https://instagram.com/techstore.official",
        tiktok: "https://tiktok.com/@yourprofile",
        youtube: "https://youtube.com/@yourchannel"
      },
      
      // Trạng thái
      isOpen: true
    };
  }
  
  // ========== CẬP NHẬT UI TỪ DỮ LIỆU ==========
  function updateUIFromData(data) {
    // Thông tin chung
    const nameInput = document.getElementById('storeName');
    const slugInput = document.getElementById('storeSlug');
    const descInput = document.getElementById('storeDescription');
    const categorySelect = document.getElementById('storeCategory');
    const taxInput = document.getElementById('taxId');
    
    if (nameInput) nameInput.value = data.name || '';
    if (slugInput) slugInput.value = data.slug || '';
    if (descInput) descInput.value = data.description || '';
    if (categorySelect) categorySelect.value = data.category || 'electronics';
    if (taxInput) taxInput.value = data.taxId || '';
    
    // Liên hệ
    const phoneInput = document.getElementById('storePhone');
    const emailInput = document.getElementById('storeEmail');
    const websiteInput = document.getElementById('storeWebsite');
    const addressInput = document.getElementById('storeAddress');
    const wardSelect = document.getElementById('storeWard');
    const districtSelect = document.getElementById('storeDistrict');
    const citySelect = document.getElementById('storeCity');
    
    if (phoneInput) phoneInput.value = data.phone || '';
    if (emailInput) emailInput.value = data.email || '';
    if (websiteInput) websiteInput.value = data.website || '';
    if (addressInput) addressInput.value = data.address || '';
    if (wardSelect) wardSelect.value = data.ward || 'tan-phong';
    if (districtSelect) districtSelect.value = data.district || 'quan-7';
    if (citySelect) citySelect.value = data.city || 'hcm';
    
    // Giờ hoạt động
    const showHoursToggle = document.getElementById('showHoursToggle');
    if (showHoursToggle) showHoursToggle.checked = data.showHours !== false;
    if (data.operatingHours) {
      // Đợi một chút để đảm bảo DOM đã sẵn sàng
      setTimeout(() => {
        renderOperatingHours(data.operatingHours);
      }, 100);
    } else {
      // Nếu chưa có, render với dữ liệu mặc định
      setTimeout(() => {
        renderOperatingHours(getDefaultStoreData().operatingHours);
      }, 100);
    }
    
    // Mạng xã hội
    const fbInput = document.getElementById('socialFacebook');
    const igInput = document.getElementById('socialInstagram');
    const ttInput = document.getElementById('socialTikTok');
    const ytInput = document.getElementById('socialYouTube');
    
    if (fbInput && data.social) fbInput.value = data.social.facebook || '';
    if (igInput && data.social) igInput.value = data.social.instagram || '';
    if (ttInput && data.social) ttInput.value = data.social.tiktok || '';
    if (ytInput && data.social) ytInput.value = data.social.youtube || '';
    
    // Toggle cửa hàng đang mở
    const storeOpenToggle = document.getElementById('storeOpenToggle');
    if (storeOpenToggle) {
      storeOpenToggle.checked = data.isOpen !== false;
      updateStoreStatusText(storeOpenToggle.checked);
      // Đợi một chút để đảm bảo các form đã được render
      setTimeout(() => {
        toggleAllForms(storeOpenToggle.checked);
      }, 200);
    }
  }
  
  // ========== TAB SWITCHING ==========
  function setupTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        
        // Xóa active từ tất cả
        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.style.display = 'none');
        
        // Thêm active cho tab được chọn
        btn.classList.add('active');
        const targetContent = document.getElementById(`tab-${targetTab}`);
        if (targetContent) {
          targetContent.style.display = 'block';
        }
      });
    });
  }
  
  // ========== TOGGLE CỬA HÀNG ĐANG MỞ ==========
  function setupStoreOpenToggle() {
    const toggle = document.getElementById('storeOpenToggle');
    if (toggle) {
      // Cập nhật text ban đầu
      updateStoreStatusText(toggle.checked);
      toggleAllForms(toggle.checked);
      
      toggle.addEventListener('change', (e) => {
        const storeData = loadStoreData() || getDefaultStoreData();
        storeData.isOpen = e.target.checked;
        saveStoreData(storeData);
        updateStoreStatusText(e.target.checked);
        toggleAllForms(e.target.checked);
        updateStoreProfile();
        
        // Gửi event để các trang khác cập nhật
        window.dispatchEvent(new CustomEvent('storeStatusChanged'));
      });
    }
  }
  
  // ========== BẬT/TẮT TẤT CẢ CÁC FORM ==========
  function toggleAllForms(isOpen) {
    // Tất cả các input, textarea, select trong các tab
    const allInputs = document.querySelectorAll('.tab-content input:not([type="checkbox"]), .tab-content textarea, .tab-content select');
    const allButtons = document.querySelectorAll('.tab-content button.btn-submit, .tab-content button.btn-cancel');
    
    allInputs.forEach(input => {
      input.disabled = !isOpen;
      if (!isOpen) {
        input.style.opacity = '0.5';
        input.style.cursor = 'not-allowed';
        input.style.backgroundColor = 'var(--bg)';
      } else {
        input.style.opacity = '1';
        input.style.cursor = 'text';
        input.style.backgroundColor = '';
      }
    });
    
    allButtons.forEach(btn => {
      btn.disabled = !isOpen;
      if (!isOpen) {
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
      } else {
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
      }
    });
    
    // Disable toggle giờ hoạt động
    const showHoursToggle = document.getElementById('showHoursToggle');
    if (showHoursToggle) {
      showHoursToggle.disabled = !isOpen;
      const toggleContainer = showHoursToggle.closest('div');
      if (toggleContainer) {
        if (!isOpen) {
          toggleContainer.style.opacity = '0.5';
        } else {
          toggleContainer.style.opacity = '1';
        }
      }
    }
    
    // Disable các toggle ngày trong tuần (nếu đã render)
    const dayToggles = document.querySelectorAll('.day-toggle');
    dayToggles.forEach(toggle => {
      toggle.disabled = !isOpen;
      const dayContainer = toggle.closest('div[style*="display: flex"]');
      if (dayContainer) {
        if (!isOpen) {
          dayContainer.style.opacity = '0.5';
        } else {
          dayContainer.style.opacity = '1';
        }
      }
    });
    
    // Disable các input giờ
    const timeInputs = document.querySelectorAll('.day-open, .day-close');
    timeInputs.forEach(input => {
      input.disabled = !isOpen;
      if (!isOpen) {
        input.style.opacity = '0.5';
        input.style.cursor = 'not-allowed';
      } else {
        input.style.opacity = '1';
        input.style.cursor = 'text';
      }
    });
    
    // Disable upload ảnh bìa
    const coverUpload = document.getElementById('coverImageUpload');
    if (coverUpload) {
      if (!isOpen) {
        coverUpload.style.opacity = '0.5';
        coverUpload.style.cursor = 'not-allowed';
        coverUpload.style.pointerEvents = 'none';
      } else {
        coverUpload.style.opacity = '1';
        coverUpload.style.cursor = 'pointer';
        coverUpload.style.pointerEvents = 'auto';
      }
    }
    
    // Thêm thông báo khi form bị disable
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => {
      let notice = tab.querySelector('.form-disabled-notice');
      if (!isOpen && !notice) {
        notice = document.createElement('div');
        notice.className = 'form-disabled-notice';
        notice.style.cssText = `
          padding: 12px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #ef4444;
          font-size: 13px;
          margin-bottom: 16px;
          text-align: center;
        `;
        notice.textContent = '⚠️ Cửa hàng đang đóng. Vui lòng mở cửa hàng để chỉnh sửa thông tin.';
        tab.insertBefore(notice, tab.firstChild);
      } else if (isOpen && notice) {
        notice.remove();
      }
    });
  }
  
  // ========== CẬP NHẬT TEXT TRẠNG THÁI ==========
  function updateStoreStatusText(isOpen) {
    const statusText = document.getElementById('storeStatusText');
    const statusSubtext = document.getElementById('storeStatusSubtext');
    const topbarBtn = document.getElementById('topbarStoreStatusBtn');
    
    // Cập nhật text trong profile card
    if (statusText) {
      statusText.textContent = isOpen ? 'Cửa hàng đang mở' : 'Cửa hàng đã đóng';
    }
    
    if (statusSubtext) {
      statusSubtext.textContent = isOpen 
        ? 'Khách hàng có thể đặt hàng' 
        : 'Khách hàng không thể đặt hàng';
    }
    
    // Cập nhật nút ở topbar
    if (topbarBtn) {
      topbarBtn.textContent = isOpen ? 'Cửa hàng đang mở' : 'Cửa hàng đã đóng';
      
      // Thay đổi class để đổi màu
      if (isOpen) {
        topbarBtn.classList.remove('btn-store-closed');
        topbarBtn.classList.add('btn-store-open');
      } else {
        topbarBtn.classList.remove('btn-store-open');
        topbarBtn.classList.add('btn-store-closed');
      }
    }
  }
  
  // ========== UPLOAD ẢNH BÌA ==========
  function setupCoverImageUpload() {
    const uploadArea = document.getElementById('coverImageUpload');
    const fileInput = document.getElementById('coverImageInput');
    const preview = document.getElementById('coverImagePreview');
    const placeholder = document.getElementById('coverImagePlaceholder');
    
    if (!uploadArea || !fileInput) return;
    
    // Xử lý file upload
    function handleFile(file) {
      if (!file) return;
      
      // Kiểm tra kích thước (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File quá lớn! Dung lượng tối đa là 5MB.');
        return;
      }
      
      // Kiểm tra loại file
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh!');
        return;
      }
      
      // Hiển thị preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (preview) {
          preview.src = event.target.result;
          preview.style.display = 'block';
        }
        if (placeholder) {
          placeholder.style.display = 'none';
        }
        
        // Hiển thị nút xóa
        showDeleteButton();
        
        // Lưu vào localStorage (base64)
        const storeData = loadStoreData() || getDefaultStoreData();
        storeData.coverImage = event.target.result;
        saveStoreData(storeData);
      };
      reader.readAsDataURL(file);
    }
    
    // Click để chọn file
    uploadArea.addEventListener('click', (e) => {
      // Không mở file dialog nếu click vào nút xóa hoặc preview
      if (e.target.closest('.delete-cover-btn') || e.target === preview) {
        return;
      }
      fileInput.click();
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
      handleFile(e.target.files[0]);
    });
    
    // Drag & Drop
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--accent)';
      uploadArea.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--border)';
      uploadArea.style.backgroundColor = 'var(--bg)';
    });
    
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--border)';
      uploadArea.style.backgroundColor = 'var(--bg)';
      
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    });
    
    // Tạo nút xóa ảnh
    function showDeleteButton() {
      let deleteBtn = uploadArea.querySelector('.delete-cover-btn');
      if (!deleteBtn) {
        deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-cover-btn';
        deleteBtn.innerHTML = '✕';
        deleteBtn.style.cssText = `
          position: absolute;
          top: 8px;
          right: 8px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          z-index: 10;
          transition: background 0.2s;
        `;
        deleteBtn.addEventListener('mouseenter', () => {
          deleteBtn.style.background = 'rgba(239, 68, 68, 0.9)';
        });
        deleteBtn.addEventListener('mouseleave', () => {
          deleteBtn.style.background = 'rgba(0, 0, 0, 0.7)';
        });
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteCoverImage();
        });
        uploadArea.appendChild(deleteBtn);
      }
      deleteBtn.style.display = 'flex';
    }
    
    // Xóa ảnh bìa
    function deleteCoverImage() {
      if (confirm('Bạn có chắc muốn xóa ảnh bìa?')) {
        const storeData = loadStoreData() || getDefaultStoreData();
        storeData.coverImage = null;
        saveStoreData(storeData);
        
        if (preview) {
          preview.src = '';
          preview.style.display = 'none';
        }
        if (placeholder) {
          placeholder.style.display = 'block';
        }
        
        const deleteBtn = uploadArea.querySelector('.delete-cover-btn');
        if (deleteBtn) {
          deleteBtn.style.display = 'none';
        }
        
        fileInput.value = '';
      }
    }
    
    // Load ảnh đã lưu
    const storeData = loadStoreData();
    if (storeData && storeData.coverImage) {
      if (preview) {
        preview.src = storeData.coverImage;
        preview.style.display = 'block';
      }
      if (placeholder) {
        placeholder.style.display = 'none';
      }
      showDeleteButton();
    }
  }
  
  // ========== QUẢN LÝ GIỜ HOẠT ĐỘNG ==========
  function setupOperatingHours() {
    const showHoursToggle = document.getElementById('showHoursToggle');
    if (showHoursToggle) {
      showHoursToggle.addEventListener('change', (e) => {
        const storeData = loadStoreData() || getDefaultStoreData();
        storeData.showHours = e.target.checked;
        saveStoreData(storeData);
      });
    }
  }
  
  function renderOperatingHours(hours) {
    const container = document.getElementById('operatingHoursList');
    if (!container) return;
    
    const days = [
      { key: 'monday', label: 'Thứ Hai' },
      { key: 'tuesday', label: 'Thứ Ba' },
      { key: 'wednesday', label: 'Thứ Tư' },
      { key: 'thursday', label: 'Thứ Năm' },
      { key: 'friday', label: 'Thứ Sáu' },
      { key: 'saturday', label: 'Thứ Bảy' },
      { key: 'sunday', label: 'Chủ Nhật' }
    ];
    
    container.innerHTML = days.map(day => {
      const dayData = hours[day.key] || { enabled: false, open: '09:00', close: '18:00' };
      return `
        <div style="display: flex; align-items: center; gap: 16px; padding: 12px; background: var(--bg); border-radius: 8px;">
          <div style="min-width: 100px; font-weight: 500;">${day.label}</div>
          <label class="toggle-switch">
            <input type="checkbox" class="day-toggle" data-day="${day.key}" ${dayData.enabled ? 'checked' : ''} />
            <span class="slider"></span>
          </label>
          <div class="day-hours" style="display: ${dayData.enabled ? 'flex' : 'none'}; align-items: center; gap: 8px; flex: 1;">
            <input type="time" class="day-open" data-day="${day.key}" value="${dayData.open}" style="flex: 1;" />
            <span>đến</span>
            <input type="time" class="day-close" data-day="${day.key}" value="${dayData.close}" style="flex: 1;" />
          </div>
          <div class="day-closed" style="display: ${dayData.enabled ? 'none' : 'block'}; color: var(--text-muted);">
            Đóng cửa
          </div>
        </div>
      `;
    }).join('');
    
    // Gắn event listeners
    container.querySelectorAll('.day-toggle').forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const day = e.target.getAttribute('data-day');
        const hoursDiv = e.target.closest('div').querySelector('.day-hours');
        const closedDiv = e.target.closest('div').querySelector('.day-closed');
        
        if (e.target.checked) {
          if (hoursDiv) hoursDiv.style.display = 'flex';
          if (closedDiv) closedDiv.style.display = 'none';
        } else {
          if (hoursDiv) hoursDiv.style.display = 'none';
          if (closedDiv) closedDiv.style.display = 'block';
        }
      });
    });
    
    // Cập nhật trạng thái disable sau khi render
    const storeData = loadStoreData();
    if (storeData) {
      setTimeout(() => {
        toggleAllForms(storeData.isOpen !== false);
      }, 50);
    }
  }
  
  // ========== LƯU DỮ LIỆU ==========
  function setupSaveButtons() {
    // Lưu thông tin chung
    const saveGeneral = document.getElementById('saveGeneral');
    if (saveGeneral) {
      saveGeneral.addEventListener('click', () => {
        const storeData = loadStoreData() || getDefaultStoreData();
        
        storeData.name = document.getElementById('storeName').value;
        storeData.slug = document.getElementById('storeSlug').value;
        storeData.description = document.getElementById('storeDescription').value;
        storeData.category = document.getElementById('storeCategory').value;
        storeData.taxId = document.getElementById('taxId').value;
        
        if (saveStoreData(storeData)) {
          alert('Đã lưu thông tin chung thành công!');
          updateStoreProfile();
        }
      });
    }
    
    // Lưu liên hệ
    const saveContact = document.getElementById('saveContact');
    if (saveContact) {
      saveContact.addEventListener('click', () => {
        const storeData = loadStoreData() || getDefaultStoreData();
        
        storeData.phone = document.getElementById('storePhone').value;
        storeData.email = document.getElementById('storeEmail').value;
        storeData.website = document.getElementById('storeWebsite').value;
        storeData.address = document.getElementById('storeAddress').value;
        storeData.ward = document.getElementById('storeWard').value;
        storeData.district = document.getElementById('storeDistrict').value;
        storeData.city = document.getElementById('storeCity').value;
        
        if (saveStoreData(storeData)) {
          alert('Đã lưu thông tin liên hệ thành công!');
        }
      });
    }
    
    // Lưu giờ hoạt động
    const saveHours = document.getElementById('saveHours');
    if (saveHours) {
      saveHours.addEventListener('click', () => {
        const storeData = loadStoreData() || getDefaultStoreData();
        
        storeData.showHours = document.getElementById('showHoursToggle').checked;
        
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        days.forEach(day => {
          const toggle = document.querySelector(`.day-toggle[data-day="${day}"]`);
          const openInput = document.querySelector(`.day-open[data-day="${day}"]`);
          const closeInput = document.querySelector(`.day-close[data-day="${day}"]`);
          
          if (toggle && openInput && closeInput) {
            storeData.operatingHours[day] = {
              enabled: toggle.checked,
              open: openInput.value,
              close: closeInput.value
            };
          }
        });
        
        if (saveStoreData(storeData)) {
          alert('Đã lưu giờ hoạt động thành công!');
        }
      });
    }
    
    // Lưu mạng xã hội
    const saveSocial = document.getElementById('saveSocial');
    if (saveSocial) {
      saveSocial.addEventListener('click', () => {
        const storeData = loadStoreData() || getDefaultStoreData();
        
        if (!storeData.social) storeData.social = {};
        storeData.social.facebook = document.getElementById('socialFacebook').value;
        storeData.social.instagram = document.getElementById('socialInstagram').value;
        storeData.social.tiktok = document.getElementById('socialTikTok').value;
        storeData.social.youtube = document.getElementById('socialYouTube').value;
        
        if (saveStoreData(storeData)) {
          alert('Đã lưu thông tin mạng xã hội thành công!');
        }
      });
    }
  }
  
  // ========== HỦY THAY ĐỔI ==========
  function setupCancelButtons() {
    const cancelButtons = ['cancelGeneral', 'cancelContact', 'cancelHours', 'cancelSocial'];
    
    cancelButtons.forEach(btnId => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener('click', () => {
          const storeData = loadStoreData();
          if (storeData) {
            updateUIFromData(storeData);
            alert('Đã hủy các thay đổi!');
          }
        });
      }
    });
  }
  
  // ========== CẬP NHẬT PROFILE CARD ==========
  function updateStoreProfile() {
    const storeData = loadStoreData();
    if (!storeData) return;
    
    // Tìm profile card (card đầu tiên)
    const profileCard = document.querySelector('.main > .card');
    if (!profileCard) return;
    
    // Cập nhật tên cửa hàng
    const storeNameEl = profileCard.querySelector('h2');
    if (storeNameEl) storeNameEl.textContent = storeData.name || 'TechStore Official';
    
    // Cập nhật handle (@techstore.official)
    const handleEl = profileCard.querySelector('div[style*="color: var(--text-muted)"]');
    if (handleEl && handleEl.textContent.includes('@')) {
      handleEl.textContent = `@${storeData.slug || 'techstore-official'}`;
    }
    
    // Cập nhật mô tả
    const descEls = profileCard.querySelectorAll('div[style*="margin-bottom: 16px"]');
    if (descEls.length > 0) {
      const descEl = Array.from(descEls).find(el => 
        el.textContent.includes('Chuyên') || el.textContent.includes('cung cấp')
      );
      if (descEl) {
        descEl.textContent = storeData.description || '';
      }
    }
  }
});
