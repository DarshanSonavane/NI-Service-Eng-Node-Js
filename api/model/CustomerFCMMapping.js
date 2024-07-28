const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

let customerFCMMappingSchema = new Schema({
    customerId : { type: Schema.Types.ObjectId, ref: 'CustomerDetail' },
    fcmKey : {
        type: String,
        default: null
    },
    deviceId : {
        type: String,
        default: null
    }, 
},{ timestamps: true })

module.exports = mongoose.model('CustomerFCMMapping', customerFCMMappingSchema);