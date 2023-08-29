import mongoose from 'mongoose';
const Schema = mongoose.Schema;

let employeeComplaintsSchema = new Schema({
    employeeId : { type: Schema.Types.ObjectId, ref: 'Employee' },
    serviceRequestId : { type: Schema.Types.ObjectId, ref: 'ServiceRequest' }
})

export default mongoose.model('EmployeeCompliants', employeeComplaintsSchema);