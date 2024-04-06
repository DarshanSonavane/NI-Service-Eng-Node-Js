const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

let appVersionSchema = new Schema({
    version : {
        type: String,
        default: null
    } 
},{ timestamps: true })

module.exports = mongoose.model('AppVersion', appVersionSchema);