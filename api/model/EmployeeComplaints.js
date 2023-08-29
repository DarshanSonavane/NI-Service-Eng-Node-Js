const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

let employeeComplaintsSchema = new Schema({
    employeeId : { type: Schema.Types.ObjectId, ref: 'Employee' },
    serviceRequestId : { type: Schema.Types.ObjectId, ref: 'ServiceRequest' }
})

module.exports = mongoose.model('EmployeeCompliants', employeeComplaintsSchema);