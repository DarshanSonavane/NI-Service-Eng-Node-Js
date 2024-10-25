const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

let customerOTPSchema = new Schema({
    customerCode : {
        type: String,
        default: null
    },
    otp : {
        type: String,
        default: null
    },
    otpType : {
        type: String,
        default: null
    },
    status : {
        type: String,
        enum: [null,'0', '1'], // 0 = De-Active , 1 = Active
        default: null,
    },
},{ timestamps: true })

module.exports = mongoose.model('CustomerOTP', customerOTPSchema);