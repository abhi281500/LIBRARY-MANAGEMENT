import mongoose from "mongoose"


const BookingSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },

    seat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seat",
        required: true
    },

    library: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Library",
        required: true
    },

    startDate: {
        type: Date,
        required: true
    },

    endDate: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        enum: [
            "ACTIVE",
            "COMPLETED",
            "CANCELLED"
        ],
        default: "ACTIVE"
    },
    amount :{
        type :String ,
        required : true
    }
}, {
    timestamps: true
});

export default mongoose.model("Booking", BookingSchema);