// ===== Helpers =====
console.log("TOTAL.JS LOADED");
window.addEventListener("DOMContentLoaded", () => console.log("DOM READY"));

const KEY = "users";
function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}
function saveUsers(users) {
  localStorage.setItem(KEY, JSON.stringify(users));
}
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}
function isValidPhone(phone) {
  return /^0\d{9}$/.test(phone);
}
function findByEmail(users, email) {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}
function findByPhone(users, phone) {
  return users.find((u) => u.phone === phone);
}
function findByLogin(users, login) {
  return isValidEmail(login)
    ? findByEmail(users, login)
    : findByPhone(users, login);
}

// ===== Đăng ký =====
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("signupPassword").value.trim();

    if (!email || !phone || !password) {
      alert("Vui lòng nhập đầy đủ thông tin đăng ký!");
      return;
    }
    if (!isValidEmail(email)) {
      alert("Email không hợp lệ!");
      return;
    }
    if (!isValidPhone(phone)) {
      alert("Số điện thoại không hợp lệ! Phải có 10 số và bắt đầu bằng 0.");
      return;
    }
    if (password.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    const users = loadUsers();
    if (findByEmail(users, email)) {
      alert("Email này đã được đăng ký!");
      return;
    }
    if (findByPhone(users, phone)) {
      alert("Số điện thoại này đã được đăng ký!");
      return;
    }

    users.push({ email, phone, password });
    saveUsers(users);

    alert("Đăng ký thành công! Hãy đăng nhập ngay nhé.");
    // 🔹 Sau khi đăng ký xong, chuyển về login
    window.location.href = "login.html";
  });
}

// ===== Đăng nhập =====
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const loginUser = document.getElementById("loginUser").value.trim();
    const loginPass = document.getElementById("loginPass").value.trim();

    if (!loginUser || !loginPass) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const users = loadUsers();
    const user = findByLogin(users, loginUser);

    if (!user) {
      alert("Tài khoản không tồn tại. Vui lòng đăng ký trước!");
      return;
    }
    if (user.password !== loginPass) {
      alert("Sai mật khẩu!");
      return;
    }

    alert("Đăng nhập thành công!");

    window.location.href = "home.html";
  });
}

// ===== Đổi mật khẩu =====
const resetForm = document.getElementById("resetForm");
if (resetForm) {
  resetForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("resetEmail").value.trim();
    const newPass = document.getElementById("newPassword").value.trim();

    if (!email || !newPass) {
      alert("Vui lòng nhập email và mật khẩu mới!");
      return;
    }
    if (!isValidEmail(email)) {
      alert("Email không hợp lệ!");
      return;
    }
    if (newPass.length < 6) {
      alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    const users = loadUsers();
    const user = findByEmail(users, email);

    if (!user) {
      alert("Email không tồn tại hoặc chưa đăng ký!");
      return;
    }

    user.password = newPass;
    saveUsers(users);

    alert("Đổi mật khẩu thành công! Mời bạn đăng nhập lại.");
    // 🔹 Sau khi đổi mật khẩu xong, về lại login
    window.location.href = "login.html";
  });
}
document.getElementById("btnAccount")?.addEventListener("click", () => {
  window.location.href = "login.html";
});

// Slider thuần JS
(function () {
  const slides = Array.from(document.querySelectorAll(".hero .slide"));
  const prev = document.querySelector(".hero .prev");
  const next = document.querySelector(".hero .next");
  const dotsWrap = document.querySelector(".hero .dots");
  let i = 0,
    timer;

  // tạo dot
  slides.forEach((_, idx) => {
    const d = document.createElement("span");
    d.className = "dot" + (idx === 0 ? " active" : "");
    d.addEventListener("click", () => show(idx));
    dotsWrap.appendChild(d);
  });
  const dots = Array.from(dotsWrap.children);

  function show(n) {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, idx) => {
      s.classList.toggle("active", idx === i);
    });
    dots.forEach((d, idx) => {
      d.classList.toggle("active", idx === i);
    });
    restart();
  }
  function nextSlide() {
    show(i + 1);
  }
  function prevSlide() {
    show(i - 1);
  }

  function start() {
    timer = setInterval(nextSlide, 5000);
  }
  function stop() {
    clearInterval(timer);
  }
  function restart() {
    stop();
    start();
  }

  next.addEventListener("click", nextSlide);
  prev.addEventListener("click", prevSlide);

  // pause khi hover
  const hero = document.getElementById("hero");
  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);

  start();
})();
// SLIDER JS
(function () {
  const slides = Array.from(document.querySelectorAll(".hero .slide"));
  const prev = document.querySelector(".hero .prev");
  const next = document.querySelector(".hero .next");
  const dotsWrap = document.querySelector(".hero .dots");
  let i = 0,
    timer;

  slides.forEach((_, idx) => {
    const d = document.createElement("span");
    d.className = "dot" + (idx === 0 ? " active" : "");
    d.addEventListener("click", () => show(idx));
    dotsWrap.appendChild(d);
  });
  const dots = Array.from(dotsWrap.children);

  function show(n) {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle("active", idx === i));
    dots.forEach((d, idx) => d.classList.toggle("active", idx === i));
    restart();
  }
  function nextSlide() {
    show(i + 1);
  }
  function prevSlide() {
    show(i - 1);
  }
  function start() {
    timer = setInterval(nextSlide, 5000);
  }
  function stop() {
    clearInterval(timer);
  }
  function restart() {
    stop();
    start();
  }

  next.addEventListener("click", nextSlide);
  prev.addEventListener("click", prevSlide);
  document.getElementById("hero").addEventListener("mouseenter", stop);
  document.getElementById("hero").addEventListener("mouseleave", start);
  start();
})();
// Lên đầu trang mượt
const toTop = document.getElementById("toTop");
window.addEventListener("scroll", () => {
  toTop.style.opacity = window.scrollY > 400 ? "1" : "0";
  toTop.style.pointerEvents = window.scrollY > 400 ? "auto" : "none";
});
toTop.addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: "smooth" })
);
const box = document.querySelector(".informationns");

document.querySelector(".slide-right").onclick = () => {
  box.scrollBy({ left: 250, behavior: "smooth" });
};
/* Rút gọn tiêu đề kí tự Nhỏ hơn hoặc bằng 100 nếu quá dài */
document.querySelector(".slide-left").onclick = () => {
  box.scrollBy({ left: -250, behavior: "smooth" });
};
document.querySelectorAll(".news-title").forEach((t) => {
  const limit = 100;
  if (t.textContent.trim().length > limit) {
    t.textContent = t.textContent.trim().slice(0, limit) + "…";
  }
});
