const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

let complaintTypeSchema = new Schema({
    name: {
        type: String,
        default: null
    }
})

module.exports = mongoose.model('ComplaintType', complaintTypeSchema);