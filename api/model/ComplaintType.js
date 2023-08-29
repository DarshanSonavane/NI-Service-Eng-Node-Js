import mongoose from 'mongoose';
const Schema = mongoose.Schema;

let complaintTypeSchema = new Schema({
    name: {
        type: String,
        default: null
    }
})

export default mongoose.model('ComplaintType', complaintTypeSchema);