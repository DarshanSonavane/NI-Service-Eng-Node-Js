const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

let notificationSchema = new Schema({
    file : {
        type: String,
        default: null
    },
    extension : {
        type: String,
        default: null
    },
    notes : {
        type: String,
        default: null
    }, 
},{ timestamps: true })

module.exports = mongoose.model('Notification', notificationSchema);