import mongoose from 'mongoose';
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
export default mongoose.model('CustomerDetail', customerDetailsSchema);