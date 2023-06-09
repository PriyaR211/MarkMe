const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    base: {
        type: String,
        require: [true, "please provide base value as subject_key"],
    },
    key: {
        type: Number,
        required: [true, "Please provide key"],
    },
    subject: {
        type: String,
        require: [true, " Please provide subject name"],
        trim: true, // Add trim property to remove leading/trailing whitespace
        uppercase: true,
    },
    branch: {
        type: String,
        require: [true, " Please provide branch"],
        trim: true, // Add trim property to remove leading/trailing whitespace
        uppercase: true,
    },
    div: {
        type: String,
        require: [true, " Please provide Division"],
        trim: true, // Add trim property to remove leading/trailing whitespace
        uppercase: true,
    },
    year: {
        type: String,
        require: [true, " Please provide Year"],
        trim: true, // Add trim property to remove leading/trailing whitespace
        uppercase: true,
    },
    folder: [],
    latitude: {
        type: Number,
        require: true,
    },
    longitude: {
        type: Number,
        require: true,
    },
    // altitude: {
    //     type: Number,
    //     require: true,
    // },
    deviceIdArray: [],
    // xl: {
    //     data: Buffer,
    //     contentType: String
    // },
    endTime : {
        type: Number,
        require : true
    }
});

module.exports = mongoose.model("Session", UserSchema);
