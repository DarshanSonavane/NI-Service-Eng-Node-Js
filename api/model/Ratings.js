import mongoose from 'mongoose';
const Schema = mongoose.Schema;

let ratingSchema = new Schema({
    employeeCode : {
        type: String,
        default: null
    },
    customerCode : {
        type: String,
        default: null
    },
    feedback : {
        type: String,
        default: null
    }
},{ timestamps: true })

export default mongoose.model('Ratings', ratingSchema);