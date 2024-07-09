const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

let machineModelSchema = new Schema({
    MODEL : {
        type: String,
        default: null
    },
    MACHINE_NO : {
        type: String,
        default: null
    } 
},{ timestamps: true })

module.exports = mongoose.model('MachineModel', machineModelSchema);