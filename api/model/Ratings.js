const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

let ratingSchema = new Schema({
    serviceRequestId : { type: Schema.Types.ObjectId, ref: 'ServiceRequest' },
    customerId : { type: Schema.Types.ObjectId, ref: 'CustomerDetail' },
    feedback : {
        type: String,
        default: null
    },
    count : {
        type: String,
        default: null
    }
},{ timestamps: true })

module.exports = mongoose.model('Ratings', ratingSchema);