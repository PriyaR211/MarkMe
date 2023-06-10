const url_user = new URLSearchParams(window.location.search);
const userName = document.querySelector(".user_name");
const userMail = document.querySelector(".mail");
const userType = document.querySelector(".user_type");
const Message = document.querySelector(".message");
const countElement = document.getElementById("count");
const timerElement = document.getElementById("timer");
const downloadButton = document.getElementById("download_btn");
const user = url_user.get("name");
const id = url_user.get("id");
const subj = id.split("_")[0];
//date and time for file name
const currentDate = new Date();
const formattedDate = currentDate
    .toLocaleString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    })
    .replace(/[^\w\s]/g, "-");

async function user_data() {
    const response = await axios
        .get(`http://localhost:4000/api/v1/feed/${user}`)
        .then((res) => {
            const userData = res.data;
            userName.textContent = `${userData.userFirstName} ${userData.userLastName}`;
            userMail.textContent = userData.userEmail;
            userType.textContent = userData.userType;
        })
        .catch((err) => {
            console.error(err);
        });
}

user_data();

async function Cancel() {
    const res = await axios
        .post(`http://localhost:4000/api/v1/delete/${id}`, {
            email: user,
            subject: subj,
        })
        .then((result) => {
            const data = result.data;
            Message.style.color = "#40ba55";
            Message.textContent = data.msg;
        })
        .catch((err) => {
            Message.style.color = "#ff3f3f";
            Message.textContent = err.response.data.msg;
        });
    location.reload();
}

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
            sheet_download();
        }
    }, 1000);
}
var server_time;
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

async function stop_session() {
    const res = await axios
        .post(`http://localhost:4000/api/v1/delete/${id}`, {
            endTime: server_time,
            subject: subj,
        })
        .then((result) => {
            Message.style.color = "#40ba55";
            Message.textContent = result.data.msg;
        })
        .catch((err) => {
            Message.style.color = "#ff3f3f";
            Message.textContent = err.response.data.msg;
        });
}

function sheet_save(data) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "buffer",
    });
    const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const filePath = URL.createObjectURL(blob);

    return filePath;
}
// console.log("hii ", sheet_save(data));

async function sheet_download() {
    const res = await axios
        .post(`http://localhost:4000/api/v1/download/${id}`)

        .then((result) => {
            const sheet = result.data.sheet_array;
            const path_url = sheet_save(sheet);
            const len = sheet.length;
            countElement.textContent = `Count : ${len}`;
            downloadButton.classList.remove("disabled");
            downloadButton.href = path_url;
            downloadButton.download = `${user}_${id}_${formattedDate}.xlsx`;
        })
        .catch((err) => {
            Message.style.color = "#ff3f3f";
            console.error(err);
        });
}
