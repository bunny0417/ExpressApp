const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    profile_picture: {
        type: String,
        required: true
    },
    roll_no: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    student_email: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
        required: true
    },
    local_address: {
        type: String,
        required: true
    },
    father_name: {
        type: String,
        required: true
    },
    father_email: {
        type: String,
        required: true
    },
    father_phone_number: {
        type: String,
        required: true
    },
    father_occupation: {
        type: String,
        required: true
    },
    mother_name: {
        type: String,
        required: true
    },
    mother_email: {
        type: String,
        required: true
    },
    mother_phone_number: {
        type: String,
        required: true
    },
    mother_occupation: {
        type: String,
        required: true
    },
    parent_address: {
        type: String,
        required: true
    },
    class_10_percentage: {
        type: String,
        required: true
    },
    class_12_percentage: {
        type: String,
        required: true
    },
    Mentor:{
        type:String,
        required:true
    },
    password: {
        type: String,
        required: true
    },
    declaration: {
        type: Boolean,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});


const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
