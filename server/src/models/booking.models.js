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

    shift: {
        type: String,
        enum: [
            "MORNING",
            "EVENING",
            "FULL_DAY",
            "NIGHT",
            "CUSTOM"
        ],
        default: "FULL_DAY",
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
    amount: {
        type: Number,
        required: true,
        min: 0,
    }
}, {
    timestamps: true
});

export default mongoose.model("Booking", BookingSchema);