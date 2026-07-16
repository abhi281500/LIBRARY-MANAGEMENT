import mongoose from 'mongoose';


const LibrarySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  
        required: true
    },
    subscription: {
        type: String,
        enum: ['FREE', 'PRO', 'ENTERPRISE'],
        default: 'FREE'
    },
    status: {
   type: String,
   enum: ["ACTIVE","INACTIVE"],
   default: "ACTIVE"
},
openTime: {
        type: String,
        required: true
    },
closeTime: {
        type: String,
        required: true
    },

    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
       
        required: true
    },
    description: {
        type: String,
        maxlength: 500
       
    },
    totalSeats: {
        type: Number,
        min: 1,
        required: true
    }
},
 { timestamps: true });

export default mongoose.model('Library', LibrarySchema);