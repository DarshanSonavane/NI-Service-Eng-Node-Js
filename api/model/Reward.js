const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

let rewardSchema = new Schema({
    employeeId : { type: Schema.Types.ObjectId, ref: 'CustomerDetail' },
    key : {
        type: String,
        default: null,
    },
    description : {
        type: String,
        default: null,
    }
},{ timestamps: true })

module.exports = mongoose.model('Reward', rewardSchema);