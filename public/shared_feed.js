const profile_array = document.querySelectorAll(".profile");
const profileInfo = document.querySelectorAll(".profile_info");

profile_array.forEach((e) => {
    e.addEventListener("click", () => {
        profileInfo.forEach((event) => {
            if (event.style.display === "none") {
                event.style.display = "block";
            } else {
                event.style.display = "none";
            }
        });
    });
});
function SignOut() {
    localStorage.clear();
    window.location.href = "login.html";
    history.replaceState(null, "", "login.html");
}
