const mongoose =  require('mongoose');
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

module.exports = mongoose.model('Ratings', ratingSchema);