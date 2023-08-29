const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

let customerDetailsSchema = new Schema({
    customerCode: {
        type: String,
        default: null
    },
    customerName: {
        type: String,
        default: null
    },
    city: {
        type: String,
        default: null
    },
    amcDue: {
        type: String,
        default: null
    }

})
module.exports =  mongoose.model('CustomerDetail', customerDetailsSchema);