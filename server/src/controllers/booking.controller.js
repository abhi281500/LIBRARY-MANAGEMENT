
import Booking from "../models/booking.model.js";
import Student from "../models/student.model.js";
import Seat from "../models/seat.model.js";
import Library from "../models/library.model.js";

export const createBooking = async (req, res) => {
    try {
        const { studentId, seatId, startDate, endDate, amount } = req.body;

        if (!studentId || !seatId || !startDate || !endDate || amount===undefined) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Find owner's library
        const library = await Library.findOne({
            owner: req.user._id
        });

        if (!library) {
            return res.status(404).json({
                message: "Library not found"
            });
        }

        // Check student belongs to this library
        const student = await Student.findOne({
            _id: studentId,
            library: library._id
        });

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        // Find seat of this library
        const seat = await Seat.findOne({
            _id: seatId,
            library: library._id
        });

        if (!seat) {
            return res.status(404).json({
                message: "Seat not found"
            });
        }

        // Seat availability check
        if (seat.status !== "AVAILABLE") {
            return res.status(400).json({
                message: "Seat is not available"
            });
        }
        const existingBooking = await Booking.findOne({
            seat: seat._id,
            status: "ACTIVE"
        });

        if (existingBooking) {
            return res.status(409).json({
                message: "Seat already has an active booking"
            });
        }
        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({
                message: "End date must be after start date"
            });
        }
        // Create booking
        const booking = await Booking.create({
            student: student._id,
            seat: seat._id,
            library: library._id,
            startDate,
            endDate,
            amount,
            status: "ACTIVE"
        });

        // Update seat status
        seat.status = "OCCUPIED";
        await seat.save();

        return res.status(201).json({
            message: "Booking created successfully",
            booking
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }
};



export const getAllBookings = async (req, res) => {
    try {
        const library = await Library.findOne({ owner: req.user._id });
        if (!library) {
            return res.status(404).json({ message: "Library not found for this owner" });
        }

        const booking = await Booking.find({ library: library._id }).populate("student").populate("seat");
        return res.status(200).json({
            message: "booking retrieved successfully",
            booking
        });


    } catch (error) {
        console.error(error)
        return res.status(500)
            .json({ message: "internal server error" })
    }
}
export const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const library = await Library.findOne({ owner: req.user._id });
        if (!library) {
            return res.status(404).json({ message: "Library not found for this owner" });
        }

        const booking = await Booking.findOne({ _id: id, library: library._id }).populate("student").populate("seat");
        if (!booking)
            return res.status(404).json({ message: "booking not found" })


        return res.status(200).json({
            message: "booking retrieved successfully",
            booking
        });

    } catch (error) {
        console.error(error);
        return res.status(500)
            .json({
                message: "internal server error"
            })


    }
}
export const updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            
            startDate,
            endDate,
            amount
        } = req.body;

        const library = await Library.findOne({ owner: req.user._id });
        if (!library) {
            return res.status(404).json({ message: "Library not found for this owner" });
        }

        const booking = await Booking.findOne({ _id: id, library: library._id });
        if (!booking)
            return res.status(404).json({ message: "booking not found" })

        
            booking.startDate = startDate ?? booking.startDate,
            booking.endDate = endDate ?? booking.endDate,
            booking.amount = amount ?? booking.amount

        await booking.save();

        return res.status(200).json({
            message: "Booking updated successfully",
            booking
        });

    }
    catch (error) {
        console.error(error)
        return res.status(500)
            .json({
                message: "internal server error"
            })
    }
}
export const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const library = await Library.findOne({ owner: req.user._id });
        if (!library) {
            return res.status(404).json({ message: "Library not found for this owner" });
        }

        const booking = await Booking.findOne({ _id: id, library: library._id });
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        const seat = await Seat.findById(booking.seat);

        if (!seat) {
            return res.status(404).json({
                message: "Seat not found"
            });
        }

        booking.status = "CANCELLED";
        seat.status = "AVAILABLE";

       
        await seat.save();
        await booking.save();
        return res.status(200).json({
            message: "Booking cancelled successfully"
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500)
            .json({ message: "internal server error" })

    }
}