 const backdrop = document.querySelectorAll(".backdrop");
const options = document.querySelectorAll(".options");
const signup = document.getElementById("sign_up_button");


signup.addEventListener("click", function () {
  backdrop.forEach((element) => {
    element.style.display = "block";
  });
  options.forEach((element) => {
    element.style.display = "flex";
  });
});

backdrop.forEach((element) => {
  element.addEventListener("click", function () {
    backdrop.forEach((element) => {
      element.style.display = "none";
    });
    options.forEach((element) => {
      element.style.display = "none";
    });
  });
});


