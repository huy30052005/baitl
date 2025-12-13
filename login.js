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

      // Trích xuất tên từ email (phần trước dấu @)
      let displayName = account;
      let avatarInitials = "U";
      
      // Kiểm tra nếu account là email
      if (account.includes("@")) {
        const emailParts = account.split("@");
        const emailName = emailParts[0];
        
        // Chuyển đổi tên email thành tên hiển thị (viết hoa chữ cái đầu)
        // Ví dụ: nguyen.van.a -> Nguyễn Văn A, hoặc nguyenhoang -> Nguyễn Hoàng
        displayName = emailName
          .split(/[._-]/) // Tách theo dấu chấm, gạch dưới, gạch ngang
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ");
        
        // Lấy chữ cái đầu tiên của mỗi từ để làm avatar
        const words = displayName.split(" ");
        if (words.length >= 2) {
          // Nếu có nhiều từ, lấy chữ cái đầu của từ đầu và từ cuối
          avatarInitials = (words[0][0] + words[words.length - 1][0]).toUpperCase();
        } else {
          // Nếu chỉ có một từ, lấy 2 chữ cái đầu
          avatarInitials = displayName.substring(0, 2).toUpperCase();
        }
      } else {
        // Nếu không phải email, dùng account làm tên và lấy chữ cái đầu
        displayName = account.charAt(0).toUpperCase() + account.slice(1);
        avatarInitials = account.substring(0, 2).toUpperCase();
      }

      // Lưu thông tin người dùng vào localStorage
      const userInfo = {
        email: account.includes("@") ? account : null,
        username: account,
        displayName: displayName,
        avatar: avatarInitials
      };
      
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
      localStorage.setItem("isLoggedIn", "true");

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
