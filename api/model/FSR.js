const mongoose =  require('mongoose');
const Schema = mongoose.Schema;
const Types = mongoose;

let fsrSchema = new Schema({
    customerCode : {
        type: String,
        default: null
    },
    contactPerson : {
        type: String,
        default: null
    },
    designation : {
        type: String,
        default: null
    },
    employeeCode : {
        type: String,
        default: null
    },
    employeeId : {type: Schema.Types.ObjectId, ref: 'Employee'},
    complaintType : {
        type: String,
        default: null
    },
    productsUsed: {
        type: [Types.Mixed], // Any data structure is allowed
        required: false,     // Optional field
        default: [],         // Defaults to empty array if not provided
    },
    remark : {
        type: String,
        default: null
    },
    correctiveAction : {
        type: String,
        default: null
    },
    status : {
        type: String,
        default: null
    },
    serviceDetails : {
        type: String,
        default: null
    },
    employeeSignature : {
        type: String,
        default: null
    },
    customerSignature : {
        type: String,
        default: null
    },
    fsrLocation : {
        type: String,
        default: null
    },
    model : {
        type: String,
        default: null
    },
    fsrStatus : {
        type: String,
        enum: [null,'0', '1'], // 0 = Approved , 1 = Raised / Open
        default: null
    },
    fsrStartTime : {
        type: String,
        default: null
    },
    fsrEndTime : {
        type: String,
        default: null
    },
    fsrFinalAmount : {
        type: String,
        default: null
    },
    isChargeable : {
        type: String,
        enum: [null,'0', '1'], // 0 = Not Chargeable , 1 = Chargeable
        default: null
    },
    complaint : {type: Schema.Types.ObjectId, ref: 'ServiceRequest'},
    natureOfCall : {
        type: String,
        default: null
    },
    totalGSTAmount : {
        type: String,
        default: null
    },
    serviceVisit : {
        type: String,
        default: null
    }
},{ timestamps: true })

module.exports = mongoose.model('FSR', fsrSchema);