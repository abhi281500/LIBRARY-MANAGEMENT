import Payment from "../models/payment.model.js";
import Booking from "../models/booking.model.js";
import Library from "../models/library.model.js";
import Seat from "../models/seat.models.js"

export const createPayment = async (req, res) => {
    try {
        const { bookingId, amount, paymentMethod } = req.body;

        if (!bookingId || amount === undefined || !paymentMethod) {
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

        // Find booking
        const booking = await Booking.findOne({
            _id: bookingId,
            library: library._id
        });

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        // Booking should be active
        if (booking.status !== "ACTIVE") {
            return res.status(400).json({
                message: "Only active bookings can be paid"
            });
        }

        // Duplicate payment check
        const existingPayment = await Payment.findOne({
            booking: booking._id,
            paymentStatus: "PAID"
        });

        if (existingPayment) {
            return res.status(409).json({
                message: "Payment already exists for this booking"
            });
        }

        // Amount validation
        if (amount !== booking.amount) {
            return res.status(400).json({
                message: "Invalid payment amount"
            });
        }

        // Receipt Number
        const receiptNumber = `PAY-${Date.now()}`;

        // Create Payment
        const payment = await Payment.create({
            booking: booking._id,
            student: booking.student,
            library: booking.library,
            amount,
            paymentMethod,
            paymentStatus: "PAID",
            paymentDate: new Date(),
            receiptNumber
        });

        return res.status(201).json({
            message: "Payment created successfully",
            payment
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: error.message
        });
    }
};


export const getAllPayments = async (req, res) => {
    try {
        const library = await Library.findOne({ owner: req.user._id });
        if (!library) {
            return res.status(404).json({ message: "Library not found for this owner" });
        }

        const payment = await Payment.find({ library: library._id }).populate("student").populate("booking");
        return res.status(200).json({
            message: "payment retrieved successfully",
            payment
        });


    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        })

    }
}
export const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;
        const library = await Library.findOne({ owner: req.user._id });
        if (!library) {
            return res.status(404).json({ message: "Library not found for this owner" });
        }

        const payment = await Payment.findOne({ _id: id, library: library._id }).populate("student").populate("booking");

        if (!payment)
            return res.status(404).json({
                message: "payment not found"
            })
        return res.status(200).json({
            message: "payment retrieved successfully",
            payment
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        })


    }
}
export const updatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentMethod } = req.body;
        const library = await Library.findOne({ owner: req.user._id });
        if (!library) {
            return res.status(404).json({ message: "Library not found for this owner" });
        }

        const payment = await Payment.findOne({ _id: id, library: library._id }).populate("student").populate("booking");
        if (!payment)
            return res.status(404).json({
                message: "payment not found"
            })



        payment.paymentMethod = paymentMethod ?? payment.paymentMethod;

        await payment.save()
        return res.status(200).json({
            message: "payment updated successfully",
            payment
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        })
    }
}
export const refundPayment = async (req, res) => {
    try {
        const { id } = req.params;

        const library = await Library.findOne({
            owner: req.user._id
        });

        if (!library) {
            return res.status(404).json({
                message: "Library not found"
            });
        }

        const payment = await Payment.findOne({
            _id: id,
            library: library._id
        });

        if (!payment) {
            return res.status(404).json({
                message: "Payment not found"
            });
        }

        if (payment.paymentStatus === "REFUNDED") {
            return res.status(400).json({
                message: "Payment is already refunded"
            });
        }

        payment.paymentStatus = "REFUNDED";

        await payment.save();
        const booking = await Booking.findById(payment.booking);
        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        booking.status = "CANCELLED";

        await booking.save();
        const seat = await Seat.findById(booking.seat);
        if (!seat) {
            return res.status(404).json({
                message: "Seat not found"
            });
        }

        seat.status = "AVAILABLE";

        await seat.save();
        payment.refundDate = new Date();

        return res.status(200).json({
            message: "Payment refunded successfully",
            payment
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: error.message
        });
    }
};