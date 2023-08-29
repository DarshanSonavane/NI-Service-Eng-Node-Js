const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

let employeeSchema = new Schema({
    firstName: {
        type: String,
        default: null
    },
    middleName: {
        type: String,
        default: null
    },
    lastName: {
        type: String,
        default: null
    },
    employeeCode: {
        type: String,
        default: null
    },
    dob: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null
    },
    gender: {
        type: String,
        enum: [null,'0', '1', '2'],
        default: null,
    },
    role : {
        type: String,
        default: null
    },
    isActive: {
        type: String,
        enum: ['0', '1', '2'],
        default: '1'
    },
},{ timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);