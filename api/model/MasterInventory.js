const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

let masterInventorySchema  = new Schema({
    productName: { type: String, default: null  },
    productCode: { type: String , default: null },
    totalQuantity: { type: Number , default: null },
    price : { type: Number , default: null },
    createdBy : {type: Schema.Types.ObjectId, ref: 'Employee'},
    updatedBy : {type: Schema.Types.ObjectId, ref: 'Employee'},
    lastUpdated: { type: Date, default: Date.now }    
},{ timestamps: true })

module.exports = mongoose.model('MasterInventory', masterInventorySchema );