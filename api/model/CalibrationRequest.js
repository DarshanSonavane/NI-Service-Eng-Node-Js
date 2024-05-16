const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

let calibrationRequestSchema = new Schema({
    customerId : { type: Schema.Types.ObjectId, ref: 'CustomerDetail' },
    machineType : {
        type: String,
        enum: [null,'0', '1', '2'], // 0 = Petrol , 1 = Diesel , 2 = Combo
        default: null,
    },
    employeeId : { type: Schema.Types.ObjectId, ref: 'Employee' },
    status : {
        type: String,
        enum: [null,'0', '1','2'], // 0 = close , 1 = Open , 2 = Assign
        default: null,
    },
},{ timestamps: true })

module.exports = mongoose.model('CalibrationRequest', calibrationRequestSchema);