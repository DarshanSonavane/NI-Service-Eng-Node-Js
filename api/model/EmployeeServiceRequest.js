const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

let employeeServiceRequestSchema = new Schema({

    employeeId : { type: Schema.Types.ObjectId, ref: 'Employee' },
    serviceRequestId : { type: Schema.Types.ObjectId, ref: 'ServiceRequest' },
},{ timestamps: true });

module.exports = mongoose.model('EmployeeServiceRequest', employeeServiceRequestSchema);