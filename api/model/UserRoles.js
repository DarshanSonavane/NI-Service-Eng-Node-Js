const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

let userRolesSchema = new Schema({
    name : {
        type: String,
        default: null,
    },
    role: {
        type: String,
        enum: [null,'0', '1'],
        default: null,
    },
})

module.exports = mongoose.model('UserRole', userRolesSchema);