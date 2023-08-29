import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const serviceRequestSchema = new Schema({
    customerId : { type: Schema.Types.ObjectId, ref: 'CustomerDetail' },
    machineType : {
        type: String,
        enum: [null,'0', '1', '2'],
        default: null,
    },
    complaintType : { type: Schema.Types.ObjectId, ref: 'ComplaintType' },
    status : {
        type: String,
        enum: [null,'0', '1','2'], // 0 = close , 1 = Open , 2 = Assign
        default: null,
    },
    assignedTo : {type: Schema.Types.ObjectId, ref: 'Employee'},
    updatedBy : { type: Schema.Types.ObjectId, ref: 'Employee' }
},{ timestamps: true })

export default mongoose.model('ServiceRequest', serviceRequestSchema);