import mongoose from "mongoose";

const SeatSchema = new mongoose.Schema({
    seatNumber: {
        type: String,
        required: true,
        trim: true
    },

    library: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Library",
        required: true
    },

    floor: {
        type: Number,
        default: 1
    },

    type: {
        type: String,
        enum: ["NORMAL", "PREMIUM"],
        default: "NORMAL"
    },

    status: {
        type: String,
        enum: [
            "AVAILABLE",
            "OCCUPIED",
            "MAINTENANCE"
        ],
        default: "AVAILABLE"
    }

}, {
    timestamps: true
});
SeatSchema.index(
    {
        library: 1,
        seatNumber: 1
    },
    {
        unique: true
    }
);
export default mongoose.model("Seat", SeatSchema);