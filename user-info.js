// User info management - Simple version that doesn't redirect

document.addEventListener("DOMContentLoaded", () => {
  updateUserInfo();
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
