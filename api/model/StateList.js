const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

let stateListSchema = new Schema({
    code : {
        type: String,
        default: null
    },
    name : {
        type: String,
        default: null
    }, 
},{ timestamps: true })

module.exports = mongoose.model('States', stateListSchema);