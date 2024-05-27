const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

let cylinderDetailsSchema = new Schema({
    CO : {
        type: String,
        default: null
    },
    CO2 : {
        type: String,
        default: null
    },
    HC : {
        type: String,
        default: null
    },
    O2 : {
        type: String,
        default: null
    },
    cylinderNumber : {
        type: String,
        default: null
    },
    cylinderMake : {
        type: String,
        default: null
    },
    validityDate : {
        type: String,
        default: null
    },
    createdBy : { type: Schema.Types.ObjectId, ref: 'Employee' },
},{ timestamps: true })

module.exports = mongoose.model('CylinderDetails', cylinderDetailsSchema);