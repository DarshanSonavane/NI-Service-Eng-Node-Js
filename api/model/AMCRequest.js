const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

let amcRequestSchema = new Schema({
    customerId : { type: Schema.Types.ObjectId, ref: 'CustomerDetail' },
    status : {
        type: String,
        enum: [null,'0', '1'], // 0 = close , 1 = Open
        default: null,
    }
},{ timestamps: true })

module.exports = mongoose.model('AMCRequest', amcRequestSchema);