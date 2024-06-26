const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

let customerDetailsSchema = new Schema({
    customerCode: {
        type: String,
        default: null
    },
    customerName: {
        type: String,
        default: null
    },
    city: {
        type: String,
        default: null
    },
    amcDue: {
        type: String,
        default: null
    },
    mobile: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null
    },
    gstNo: {
        type: String,
        default: null
    },
    password : {
        type : String,
        default : null
    },
    petrolMachineNumber : {
        type : String,
        default : null
    },
    dieselMachineNumber : {
        type : String,
        default : null
    },
    comboMachineNumber : {
        type : String,
        default : null
    },
    stateCode : {
        type : String,
        default : null
    },
    machineModel : {
        type : String,
        default : null
    }

})
module.exports =  mongoose.model('CustomerDetail', customerDetailsSchema);