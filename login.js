document.addEventListener("DOMContentLoaded", function () {
  // ============ XỬ LÝ FORM ĐĂNG KÝ (trang sinup.html) ============
  const registerForm = document.getElementById("registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault(); // chặn submit mặc định

      const phone = registerForm.phone.value.trim();
      const email = registerForm.email.value.trim();
      const password = registerForm.password.value.trim();

      const phoneRegex = /^0\d{9}$/; // 10 số, bắt đầu bằng 0
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!phone || !email || !password) {
        alert("Vui lòng nhập đầy đủ Số điện thoại, Email và Mật khẩu!");
        return;
      }

      if (!phoneRegex.test(phone)) {
        alert(
          "Số điện thoại không hợp lệ!\nVí dụ đúng: 0987654321 (10 số, bắt đầu bằng 0)"
        );
        registerForm.phone.focus();
        return;
      }

      if (!emailRegex.test(email)) {
        alert("Email không đúng định dạng!\nVí dụ: ten@gmail.com");
        registerForm.email.focus();
        return;
      }

      if (password.length < 6) {
        alert("Mật khẩu phải có ít nhất 6 ký tự!");
        registerForm.password.focus();
        return;
      }

      alert("Đăng ký thành công!");

      // Sau khi đăng ký xong quay về trang đăng nhập
      window.location.href = "login.html";
    });
  }

  // ============ XỬ LÝ FORM ĐĂNG NHẬP (trang login.html) ============
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault(); // chặn submit mặc định

      const account = loginForm.account.value.trim();
      const password = loginForm.password.value.trim();

      if (!account || !password) {
        alert("Vui lòng nhập đầy đủ Tài khoản và Mật khẩu!");
        return;
      }

      if (password.length < 6) {
        alert("Mật khẩu phải có ít nhất 6 ký tự!");
        loginForm.password.focus();
        return;
      }

      alert("Đăng nhập thành công!");

      // Chuyển sang TRANG QUẢN TRỊ NGƯỜI BÁN
      window.location.href = "index.html";
    });
  }

  // ============ XỬ LÝ FORM QUÊN MẬT KHẨU / ĐẶT LẠI (trang forgot.html) ============
  const forgotForm = document.getElementById("forgotForm");

  if (forgotForm) {
    forgotForm.addEventListener("submit", function (e) {
      e.preventDefault(); // chặn submit mặc định

      const account = forgotForm.account.value.trim();
      const newPassword = forgotForm.newPassword.value.trim();
      const confirmPassword = forgotForm.confirmPassword.value.trim();

      if (!account || !newPassword || !confirmPassword) {
        alert("Vui lòng nhập đầy đủ Tài khoản và hai ô mật khẩu!");
        return;
      }

      if (newPassword.length < 6) {
        alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
        forgotForm.newPassword.focus();
        return;
      }

      if (newPassword !== confirmPassword) {
        alert("Mật khẩu nhập lại không khớp. Vui lòng kiểm tra lại!");
        forgotForm.confirmPassword.focus();
        return;
      }

      alert(
        "Đặt lại mật khẩu thành công!\nBạn hãy đăng nhập bằng mật khẩu mới."
      );

      // Sau khi đặt lại xong, quay về trang đăng nhập
      window.location.href = "login.html";
    });
  }

  // ============ ICON 👁 HIỆN / ẨN MẬT KHẨU (DÙNG CHUNG CHO MỌI TRANG) ============
  const toggles = document.querySelectorAll(".toggle-password");

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", function () {
      const inputId = this.getAttribute("data-input");
      const input = document.getElementById(inputId);
      if (!input) return;

      if (input.type === "password") {
        input.type = "text";
        this.classList.add("active");
        this.textContent = "🙈"; // đang hiện mật khẩu
      } else {
        input.type = "password";
        this.classList.remove("active");
        this.textContent = "👁"; // đang ẩn mật khẩu
      }
    });
  });
});
