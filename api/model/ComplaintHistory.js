const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

let complaintHistory = new Schema({
    requestId : { type: Schema.Types.ObjectId, ref: 'ServiceRequest' },
    status : {
        type: String,
        enum: [null,'0', '1','2'], // 0 = close , 1 = Open , 2 = Assign
        default: null,
    }
},{ timestamps: true })

module.exports = mongoose.model('ComplaintHistory', complaintHistory);