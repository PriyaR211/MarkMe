const url_user = new URLSearchParams(window.location.search);
const userName = document.querySelector(".user_name");
const userMail = document.querySelector(".mail");
const userType = document.querySelector(".user_type");
const branch = document.querySelector(".branch");
const div = document.querySelector(".Div");
const roll_no = document.querySelector(".roll_no");
const timerElement = document.getElementById("timer");
let user_roll;
let user_mail; // for global use

//profile access

async function user_data() {
    const email = url_user.get("name");
    const res = await axios
        .get(`http://localhost:4000/api/v1/feed/${email}`)
        .then((res) => {
            const userData = res.data;
            userName.textContent = `${userData.userFirstName} ${userData.userLastName}`;
            userMail.textContent = userData.userEmail;
            userType.textContent = userData.userType;
            branch.textContent = userData.userBranch;
            div.textContent = userData.userDiv;
            roll_no.textContent = userData.userRollNo;
            user_roll = userData.userRollNo;
            user_mail = userData.userEmail;
        })
        .catch((err) => {
            console.error(err);
        });
}

user_data();

// to prevent default submit action of html form
function submitHandler(event) {
    event.preventDefault();
    document.getElementById("myForm").reset();
}

//Location access
var S_Latitude;
var S_Longitude;
var ipAddress;
// var S_Altitude;

function student_location() {
    const options_obj = {
        enableHighAccuracy: true,
        timeout: 2000,
    };
    const successCallback = (position) => {
        S_Latitude = position.coords.latitude;
        S_Longitude = position.coords.longitude;
        S_Altitude = position.coords.altitude;
        console.log(S_Longitude);
        console.log(S_Latitude);
    };
    const errorCallback = (error) => {
        console.log("Error getting student's location: " + error.message);
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            successCallback,
            errorCallback,
            options_obj
        );
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}
student_location();

//ip extraction
async function getIpAddress() {
    try {
        const response = await axios.get("https://api.ipify.org?format=json");
        ipAddress = response.data.ip;
        console.log(ipAddress); // Output the IP address to
    } catch (error) {
        console.error("Error:", error);
    }
}

getIpAddress();

//timer
function startTimer(endTime) {
    // var duration = 5 * 60 * 1000; // 5 minutes in milliseconds
    // var endTime = new Date().getTime() + duration;
    var intervalId = setInterval(function () {
        var currentTime = new Date().getTime();
        var remainingTime = endTime - currentTime;

        if (remainingTime > 0) {
            var minutes = Math.floor(
                (remainingTime % (1000 * 60 * 60)) / (1000 * 60)
            );
            var seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

            var formattedMinutes = ("0" + minutes).slice(-2);
            var formattedSeconds = ("0" + seconds).slice(-2);
            timerElement.textContent =
                "Time Remaining: " + formattedMinutes + ":" + formattedSeconds;
            // console.log(formattedMinutes + ":" + formattedSeconds);
        }

        if (remainingTime <= 0) {
            clearInterval(intervalId);
            console.log("Timer has ended!");
            // sheet_download();
        }
    }, 1000);
}

async function get_time() {
    const res = await axios
        .get(`http://localhost:4000/api/v1/feed/timer/${id}`)
        .then((result) => {
            server_time = result.data.endTime;
            startTimer(server_time);
        })
        .catch((err) => {
            Message.style.color = "#ff3f3f";
            Message.textContent = err.response.data.msg;
        });
}
get_time();

const sub = document.getElementById("subject");
const code = document.getElementById("code");
const markme_btn = document.getElementById("markme");
const mess = document.querySelector(".message");

markme_btn.addEventListener("click", async () => {
    const subject = sub.value;
    const key = code.value;
    const rollno = user_roll;
    const res = await axios
        .post("http://localhost:4000/api/v1/mark", {
            key: key,
            subject: subject,
            rollNo: rollno,
            email: user_mail,
            studentLat: S_Latitude,
            studentLon: S_Longitude,
            deviceId: ipAddress,
        })
        .then((result) => {
            mess.style.color = "#40ba55";
            mess.textContent = result.data.msg;
        })
        .catch((error) => {
            if (error.response) {
                mess.style.color = "#ff3f3f";
                mess.textContent = error.response.data.msg;
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log("Error", error.message);
            }
            console.log(error.config);
        });
});
