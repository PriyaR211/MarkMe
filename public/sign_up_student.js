const fname = document.getElementById("name");
const lname = document.getElementById("l_name");
const div = document.getElementById("div");
const branch = document.getElementById("branch");
const rollno = document.getElementById("roll_no");
const mobileno = document.getElementById("m_no");
const email = document.getElementById("mail");
const password = document.getElementById("pass");
const cpassword = document.getElementById("c_pass");
const Message = document.querySelector(".message");

function submitHandler(event) {
    // to prevent default submit action of html form
    event.preventDefault();
}

async function handelRegister() {
    var fName = fname.value;
    var lName = lname.value;
    var Div = div.value;
    var Branch = branch.value;
    var RollNo = rollno.value;
    var MobileNo = mobileno.value;
    var Email = email.value;
    var Password = password.value;
    var CPassword = cpassword.value;
    const response = await axios
        .post("http://localhost:4000/api/v1/auth/register/student", {
            firstName: fName,
            lastName: lName,
            div: Div,
            rollNo: RollNo,
            mobileNo: MobileNo,
            email: Email,
            password: Password,
            confPassword: CPassword,
            branch: Branch,
        })
        .then((response) => {
            Message.style.color = "#40ba55";
            Message.textContent = "Sign Up Successful";
            // alert("SignUp Successful");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        })
        .catch((error) => {
            Message.style.color = "#ff3f3f";
            if (
                error.response.data.msg ==
                "Duplicate value entered for email field, please choose another value"
            ) {
                Message.textContent = "Account Already Exist For Same Email";
            }
            // alert(error.response.data.msg);
        });
}
