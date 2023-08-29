import mongoose from 'mongoose';
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

export default mongoose.model('UserRole', userRolesSchema);