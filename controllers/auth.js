const User = require("../models/student");
const { StatusCodes } = require("http-status-codes");
const teacher = require("../models/teacher");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const Session = require("../models/session");
const geoip = require("geoip-lite");
const geolib = require("geolib");

// student register
const studentRegister = async (req, res) => {
    const {
        firstName,
        lastName,
        div,
        branch,
        rollNo,
        mobileNo,
        email,
        password,
        confPassword,
    } = req.body;

    if (password != confPassword) {
        throw new BadRequestError("Password and confirm password do not match");
    } else {
        const user = await User.create({
            firstName,
            lastName,
            div,
            branch,
            rollNo,
            mobileNo,
            email,
            password,
            teacher: false,
        });

        const token = user.createJWT();
        res.status(StatusCodes.CREATED).json({
            firstName,
            lastName,
            div,
            branch,
            rollNo,
            email,
            teacher: false,
            token,
        });
    }
    console.log("in student register");
};

// teacher register
const teacherRegister = async (req, res) => {
    const { firstName, lastName, email, password, confPassword } = req.body;
    if (password != confPassword) {
        throw new BadRequestError("Password and confirm password do not match");
    } else {
        const user = await teacher.create({
            firstName,
            lastName,
            email,
            password,
            teacher: true,
        });
        const token = user.createJWT();
        res.status(StatusCodes.CREATED).json({
            firstName,
            lastName,
            email,
            teacher: true,
            token,
        });
    }
    console.log("in teacher register");
};

// common login for both teacher and student
const login = async (req, res) => {
    console.log("start of login");
    const { email, password } = req.body;

    if (!email || !password) {
        throw new BadRequestError("Please provide both email and password");
    }
    let user = await teacher.findOne({ email });
    if (!user) {
        user = await User.findOne({ email });
        if (!user) {
            throw new UnauthenticatedError("Invalid Credentials");
        }
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new UnauthenticatedError("Invalid Credentials");
    }
    // compare password
    const token = user.createJWT();
    res.status(StatusCodes.OK).json({
        message: "sending loging data",
        user: user.teacher,
        email_id: user.email,
        token,
    });
    console.log("end of login");
};

// feeding profile data
const feedData = async (req, res) => {
    const email = req.params.email;
    let user = await teacher.findOne({ email });
    if (!user) {
        user = await User.findOne({ email });
        if (!user) {
            throw new UnauthenticatedError("User not found");
        }
    }
    if (user.teacher === false) {
        res.status(StatusCodes.OK).json({
            userFirstName: user.firstName,
            userLastName: user.lastName,
            userRollNo: user.rollNo,
            userBranch: user.branch,
            userDiv: user.div,
            userEmail: user.email,
            userType: "Student",
        });
    } else {
        res.status(StatusCodes.OK).json({
            userFirstName: user.firstName,
            userLastName: user.lastName,
            userEmail: user.email,
            userType: "Teacher",
        });
    }
};

//feed for timer , endTime
const feedTimer = async (req, res) => {
    const base = req.params.base;
    // console.log(base)
    const lecture = await Session.findOne({ base: base });
    if (!lecture) {
        return res.status(StatusCodes.BAD_GATEWAY).json({
            msg: `No session found with base ${base} `,
        });
    }
    // console.log(lecture)
    // console.log(lecture.endTime);
    res.status(StatusCodes.OK).json({
        endTime: lecture.endTime,
    });
};

//generating session
const generateSession = async (req, res) => {
    console.log("start of generate session");
    const { base, key, subject, year, branch, div, latitude, longitude } =
        req.body;
    const checkBase = await Session.findOne({ base });
    if (checkBase) {
        throw new BadRequestError("Already session is present with same key");
    } else {
        const endTime = new Date().getTime() + 5 * 60 * 1000;
        // console.log(endTime)
        const newSession = await Session.create({
            base,
            key,
            subject,
            branch,
            year,
            div,
            folder: [],
            latitude,
            longitude,
            endTime,
        });
        res.status(StatusCodes.CREATED).json({
            msg: `Session Created Successfully with code ${key}`,
            newSession,
        });
    }
    console.log("end of genearte session");
};

// ${key} `Marked data for session with key and subject ${subject}`
const markData = async (req, res) => {
    console.log("start of mark data");
    const { key, subject, email, studentLat, studentLon, deviceId } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.send({ msg: "No user present" });
    }

    const currentTime = new Date().getTime();
    const base = `${subject}_${key}`;

    const presentSession = await Session.findOne({ base });
    if (!presentSession) {
        return res.status(StatusCodes.BAD_REQUEST).send({
            msg: "Attention: Session not found or it appears you may be running late.",
        });
    }

    if (presentSession.endTime <= currentTime) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            msg: "You are running out of Time !!!",
        });
    }

    console.log("i am here");
    const checkRollNo = await Session.findOne({
        base: base,
        folder: { $elemMatch: { rollNo: user.rollNo } },
    });
    // console.log(checkRollNo);
    if (checkRollNo) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            msg: "You already Marked !!",
        });
    }

    const ip = await Session.findOne({
        base: base,
        deviceIdArray: { $elemMatch: { deviceId: deviceId } },
    });

    // const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    // const geo = geoip.lookup(clientIP);

    // // Check if the IP is outside India
    // if (geo && geo.country !== "IN") {
    //     // IP is outside India, block the request
    //     return res.status(403).send("Access denied. IP address outside India.");
    // }
    // console.log(ip);
    if (ip) {
        return res.status(StatusCodes.CONFLICT).json({
            msg: "Don't ever try too cheat! MarkMe is watching 👀 you",
            // msg: "Na Munna Na Tu toh apane .....!!! MarkMe is 👀 you",
        });
    }

    if (
        user.div != presentSession.div ||
        user.branch != presentSession.branch
    ) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: "Student not belong to same class" });
    }

    const userWithinRadius = isWithinRadius(
        presentSession.latitude,
        presentSession.longitude,
        studentLat,
        studentLon,
        100
    );
    console.log(userWithinRadius); // true or false

    // if(userWithinRadius==false){
    //    return res.status(StatusCodes.BAD_REQUEST).json({msg:"You are not in range !!!"})
    // }

    const result = await Session.updateOne(
        { base },
        {
            $push: {
                folder: {
                    rollNo: user.rollNo,
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
                deviceIdArray: {
                    deviceId: deviceId,
                },
            },
        }
    );

    if (result.nModified === 0) {
        return res.status(StatusCodes.BAD_REQUEST).send({
            msg: "Attention: Session not found or it appears you may be running late.",
        });
    }

    res.status(StatusCodes.CREATED).send({
        msg: "Attendance Marked Successfully",
    });
    console.log("end of markData");
};

//Auxillary functions for location
function calculateDistance(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371e3; // Earth's radius in meters
    const phi1 = degToRad(lat1);
    const phi2 = degToRad(lat2);
    const deltaPhi = degToRad(lat2 - lat1);
    const deltaLambda = degToRad(lon2 - lon1);

    const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) *
            Math.cos(phi2) *
            Math.sin(deltaLambda / 2) *
            Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c;

    return distance;
}

function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

function isWithinRadius(myLat, myLon, userLat, userLon, radiusInFeet) {
    const radiusInMeters = radiusInFeet * 0.3048; // Convert feet to meters
    const distance = calculateDistance(myLat, myLon, userLat, userLon);
    return distance <= radiusInMeters;
}

const deleteSession = async (req, res) => {
    const base = req.params.base;
    const { email } = req.body;
    const user = await teacher.findOne({ email });
    if (!user.teacher) {
        return res.status(StatusCodes.UNAUTHORIZED).send("Unauthorized Action");
    }
    const lecture = await Session.findOneAndDelete({ base: base });
    if (!lecture) {
        return res.status(404).json({ msg: "Session Not Found !!" });
    }
    res.status(200).json({ msg: "Session deleted Successfully" });
};

// Ending the session at any time
const stopSession = async (req, res) => {
    const base = req.params.base;
    const { endTime, subject } = req.body;

    const presentSession = await Session.findOne({ subject, base });

    if (!presentSession) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: "Unable to find session" });
    }

    const result = await Session.updateOne({ base }, { endTime: endTime });

    if (!result.nModified) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: "Oop's something went wrong!!!" });
    }

    res.status(StatusCodes.OK).json({ msg: "Session Stoped ", presentSession });
};

const downloadSheet = async (req, res) => {
    const base = req.params.base;

    const lecture = await Session.findOne({ base: base });

    const sheet = await lecture.folder.sort((a, b) => a.rollNo - b.rollNo);
    res.status(StatusCodes.OK).json({ sheet_array: sheet });
};

module.exports = {
    studentRegister,
    teacherRegister,
    login,
    feedData,
    generateSession,
    markData,
    deleteSession,
    stopSession,
    downloadSheet,
    feedTimer,
};
