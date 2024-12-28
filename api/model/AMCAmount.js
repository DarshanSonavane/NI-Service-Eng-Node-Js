const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

let amcAmountSchema = new Schema({
    type : {
        type: String,
        enum: [null,'0', '1' , '2'], // 0 = Petrol , 1 = Diesel , 2 = Combo
        default: null
    },
    amount : {
        type: String,
        default: null
    },
    gstAmount : {
        type: String,
        default: null
    },
    totalAmount : {
        type: String,
        default: null
    },
    modelType : {
        type: String,
        default: null
    }
},{ timestamps: true })

module.exports = mongoose.model('AMCAmount', amcAmountSchema);