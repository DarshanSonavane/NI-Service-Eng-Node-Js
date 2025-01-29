const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

let employeeInventorySchema  = new Schema({
    employeeId : {type: Schema.Types.ObjectId, ref: 'Employee'},
    productId: { type: Schema.Types.ObjectId, ref: 'MasterInventory' }, 
    assignedQuantity: { type: Number, default: null },
    createdBy : {type: Schema.Types.ObjectId, ref: 'Employee'},
    updatedBy : {type: Schema.Types.ObjectId, ref: 'Employee' , default : null},
    lastUpdated: { type: Date, default: Date.now }    
},{ timestamps: true })

module.exports = mongoose.model('EmployeeInventory', employeeInventorySchema );