import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        minlength: 8,
        required: true
    },
    phone: {
        type: String,
        trim: true

    },
    role: {
        type: String,
        enum: [
            "SUPER_ADMIN",
            "LIBRARY_OWNER",
            "STUDENT"
        ],
        default: 'LIBRARY_OWNER'
    },
    subscription: {
        type: String,
        enum: ['Free', 'Pro', 'Enterprise'],
        default: 'Free'
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return ;
    }

    this.password = await hashPassword(this.password);
;
});

UserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}



async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}



export default mongoose.model('User', UserSchema);