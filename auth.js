// Authentication JavaScript
// Dùng cho login.html, signup.html, reset-password.html

document.addEventListener('DOMContentLoaded', function() {
  // Common functions for all auth pages
  
  // Add focus effects to inputs
  const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.style.borderColor = '#4F46E5';
      this.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
    });
    
    input.addEventListener('blur', function() {
      this.style.borderColor = '#D1D5DB';
      this.style.boxShadow = 'none';
    });
  });

  // Button hover effects
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
      this.style.boxShadow = '0 10px 25px rgba(79, 70, 229, 0.3)';
    });
    
    btn.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '0 4px 14px rgba(79, 70, 229, 0.2)';
    });
  });
});

// Login Page Functions
function initLogin() {
  const form = document.querySelector('form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rememberCheckbox = document.querySelector('input[type="checkbox"]');
  
  if (!form || !emailInput || !passwordInput) return;
  
  // Load remembered email
  if (localStorage.getItem('rememberedEmail')) {
    emailInput.value = localStorage.getItem('rememberedEmail');
    if (rememberCheckbox) rememberCheckbox.checked = true;
  }
  
  // Form submit handler
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Validation
    if (!email) {
      showAlert('Vui lòng nhập email!', 'error');
      emailInput.focus();
      return;
    }
    
    if (!password) {
      showAlert('Vui lòng nhập mật khẩu!', 'error');
      passwordInput.focus();
      return;
    }
    
    if (!validateEmail(email)) {
      showAlert('Email không hợp lệ!', 'error');
      emailInput.focus();
      return;
    }
    
    // Save email if remember me is checked
    if (rememberCheckbox && rememberCheckbox.checked) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
    
    // Show loading state
    const submitBtn = form.querySelector('.btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Đang đăng nhập...';
    submitBtn.disabled = true;
    
    // Simulate login (replace with actual API call)
    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      
      // Store user session
      localStorage.setItem('userEmail', email);
      localStorage.setItem('isLoggedIn', 'true');
      
      showAlert('Đăng nhập thành công!', 'success');
      
      // Redirect after delay
      setTimeout(() => {
        window.location.href = 'product-list (1).html';
      }, 1000);
    }, 1500);
  });
  
  // SSO button handlers
  const ssoButtons = document.querySelectorAll('.sso-btn');
  ssoButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const provider = this.textContent.includes('Google') ? 'Google' : 'Facebook';
      showAlert(`Đăng nhập bằng ${provider} - Tính năng đang phát triển!`, 'info');
    });
  });
}

// Signup Page Functions
function initSignup() {
  const form = document.querySelector('form');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const termsCheckbox = document.querySelector('input[type="checkbox"]');
  
  if (!form || !nameInput || !emailInput || !passwordInput) return;
  
  // Form submit handler
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Validation
    if (!name) {
      showAlert('Vui lòng nhập họ và tên!', 'error');
      nameInput.focus();
      return;
    }
    
    if (!email) {
      showAlert('Vui lòng nhập email!', 'error');
      emailInput.focus();
      return;
    }
    
    if (!validateEmail(email)) {
      showAlert('Email không hợp lệ!', 'error');
      emailInput.focus();
      return;
    }
    
    if (!password) {
      showAlert('Vui lòng nhập mật khẩu!', 'error');
      passwordInput.focus();
      return;
    }
    
    if (password.length < 6) {
      showAlert('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
      passwordInput.focus();
      return;
    }
    
    if (termsCheckbox && !termsCheckbox.checked) {
      showAlert('Vui lòng đồng ý với Điều khoản sử dụng!', 'error');
      return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('.btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Đang tạo tài khoản...';
    submitBtn.disabled = true;
    
    // Simulate signup
    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      
      showAlert(`Đăng ký thành công! Chào mừng ${name}!`, 'success');
      
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    }, 2000);
  });
  
  // Password strength indicator
  if (passwordInput) {
    passwordInput.addEventListener('input', function() {
      const password = this.value;
      const strength = getPasswordStrength(password);
      
      let indicator = document.querySelector('.password-strength');
      if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'password-strength';
        indicator.style.cssText = 'margin-top: 5px; font-size: 12px; font-weight: 600;';
        this.parentElement.appendChild(indicator);
      }
      
      if (password.length > 0) {
        indicator.textContent = `Độ mạnh: ${strength.text}`;
        indicator.style.color = strength.color;
      } else {
        indicator.textContent = '';
      }
    });
  }
  
  // SSO handlers
  const ssoButtons = document.querySelectorAll('.sso-btn');
  ssoButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const provider = this.textContent.includes('Google') ? 'Google' : 'Facebook';
      showAlert(`Đăng ký bằng ${provider} - Tính năng đang phát triển!`, 'info');
    });
  });
}

// Reset Password Page Functions
function initResetPassword() {
  const form = document.querySelector('form');
  const emailInput = document.getElementById('email');
  
  if (!form || !emailInput) return;
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    
    if (!email) {
      showAlert('Vui lòng nhập email!', 'error');
      emailInput.focus();
      return;
    }
    
    if (!validateEmail(email)) {
      showAlert('Email không hợp lệ!', 'error');
      emailInput.focus();
      return;
    }
    
    const submitBtn = form.querySelector('.btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Đang gửi...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
      submitBtn.textContent = 'Gửi lại';
      submitBtn.disabled = false;
      
      showAlert(`Đã gửi hướng dẫn đặt lại mật khẩu đến ${email}!`, 'success');
      
      // Add success message
      let successMsg = form.querySelector('.success-message');
      if (!successMsg) {
        successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.style.cssText = `
          background: #d1fae5;
          color: #065f46;
          padding: 12px;
          border-radius: 8px;
          margin-top: 16px;
          font-size: 14px;
          border: 1px solid #a7f3d0;
        `;
        successMsg.textContent = '✅ Email đã được gửi! Vui lòng kiểm tra hộp thư của bạn.';
        form.appendChild(successMsg);
        
        setTimeout(() => successMsg.remove(), 5000);
      }
    }, 2000);
  });
  
  // Typing effect
  emailInput.addEventListener('input', function() {
    if (this.value.length > 0) {
      this.style.borderColor = '#10b981';
    } else {
      this.style.borderColor = '#D1D5DB';
    }
  });
  
  // Placeholder animation
  emailInput.addEventListener('focus', function() {
    if (this.value === '') {
      this.placeholder = 'Ví dụ: user@example.com';
    }
  });
  
  emailInput.addEventListener('blur', function() {
    if (this.value === '') {
      this.placeholder = 'Nhập email của bạn';
    }
  });
}

// Utility Functions
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function getPasswordStrength(password) {
  let score = 0;
  
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  if (score < 2) return { text: 'Yếu', color: '#ef4444' };
  if (score < 4) return { text: 'Trung bình', color: '#f59e0b' };
  return { text: 'Mạnh', color: '#10b981' };
}

function showAlert(message, type = 'info') {
  // Create custom alert
  const alertDiv = document.createElement('div');
  alertDiv.className = `custom-alert alert-${type}`;
  
  const colors = {
    success: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
    error: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
    info: { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' }
  };
  
  const color = colors[type] || colors.info;
  
  alertDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${color.bg};
    color: ${color.text};
    padding: 16px 24px;
    border-radius: 10px;
    border: 1px solid ${color.border};
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease;
    font-weight: 600;
    max-width: 400px;
  `;
  
  alertDiv.textContent = message;
  document.body.appendChild(alertDiv);
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(400px); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
  
  setTimeout(() => {
    alertDiv.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => alertDiv.remove(), 300);
  }, 3000);
}

// Check session
function checkSession() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const currentPage = window.location.pathname.split('/').pop();
  
  // If logged in and on auth page, redirect to products
  if (isLoggedIn === 'true' && ['login.html', 'signup.html'].includes(currentPage)) {
    // Uncomment to enable auto-redirect
    // window.location.href = 'product-list.html';
  }
}

// Initialize appropriate page
function initAuthPage() {
  const currentPage = window.location.pathname.split('/').pop();
  
  switch(currentPage) {
    case 'login.html':
      initLogin();
      break;
    case 'signup.html':
      initSignup();
      break;
    case 'reset-password.html':
      initResetPassword();
      break;
  }
  
  checkSession();
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuthPage);
} else {
  initAuthPage();
}


