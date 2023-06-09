const fname = document.getElementById("name");
const lname = document.getElementById("l_name");
const mobileno = document.getElementById("m_no");
const email = document.getElementById("mail");
const password = document.getElementById("pass");
const cpassword = document.getElementById("c_pass");
const Message = document.querySelector(".message");

function submitHandler(event) {
    event.preventDefault();
}

async function handelRegister() {
    var fName = fname.value;
    var lName = lname.value;
    var MobileNo = mobileno.value;
    var Email = email.value;
    var Password = password.value;
    var CPassword = cpassword.value;
    const response = await axios
        .post("http://localhost:4000/api/v1/auth/register/teacher", {
            firstName: fName,
            lastName: lName,
            mobileNo: MobileNo,
            email: Email,
            password: Password,
            confPassword: CPassword,
        })
        .then((response) => {
            Message.style.color = "#40ba55";
            Message.textContent = "Sign Up Successful";
            // alert("SignUp Successful");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
        })
        .catch((error) => {
            Message.style.color = "#ff3f3f";
            if (
                error.response.data.msg ==
                "Duplicate value entered for email field, please choose another value"
            ) {
                Message.textContent = "Account Already Exist For Same Email";
            }
            // alert(err.message);
        });
}
