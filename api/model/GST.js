const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

let gstSchema = new Schema({
    gstPercent : {
        type: String,
        default: null
    },
},{ timestamps: true })

module.exports = mongoose.model('GST', gstSchema);