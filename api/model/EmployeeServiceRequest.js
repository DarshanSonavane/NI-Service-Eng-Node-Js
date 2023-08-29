import mongoose from 'mongoose';
const Schema = mongoose.Schema;

let employeeServiceRequestSchema = new Schema({

    employeeId : { type: Schema.Types.ObjectId, ref: 'Employee' },
    serviceRequestId : { type: Schema.Types.ObjectId, ref: 'ServiceRequest' },
},{ timestamps: true });

export default mongoose.model('EmployeeServiceRequest', employeeServiceRequestSchema);