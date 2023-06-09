const login_button = document.getElementById("login_btn");
const mail = document.getElementById("mail");
const password = document.getElementById("pass");
const login_form = document.querySelector(".login-form");
const mess = document.querySelector(".message");

function submitHandler(event) {
    // to prevent default submit action of html form
    event.preventDefault();
    document.getElementById("myForm").reset();
}

async function myFunction() {
    var mailvalue = mail.value;
    var passwordvalue = password.value;

    const response = await axios
        .post("http://localhost:4000/api/v1/auth/login", {
            email: mailvalue,
            password: passwordvalue,
        })

        .then((response) => {
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", response.data.user);
            const { token, user } = response.data;
            // console.log("user : ", user);

            if (localStorage.getItem("token")) {
                // console.log("Token found:", token);
                const userName = response.data.email_id;
                if (user) {
                    const url = `teacher_feed.html?name=${encodeURIComponent(
                        userName
                    )}`;
                    window.location.href = url;
                } else {
                    const url = `student_feed.html?name=${encodeURIComponent(
                        userName
                    )}`;
                    window.location.href = url;
                }
            }
        })

        .catch((error) => {
            mess.style.color = "#ff3f3f";
            mess.textContent = error.response.data.msg;
            // alert(error.response.data.msg);
            setTimeout(() => {
                mess.textContent = "";
            }, 2000);
        });
}
