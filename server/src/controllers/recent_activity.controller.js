import Booking from "../models/booking.models.js";
import Payment from "../models/payment.models.js";
import Library from "../models/library.models.js";

export const getRecentActivities = async (req, res) => {
    try {

        const library = await Library.findOne({
            owner: req.user._id
        });

        if (!library) {
            return res.status(404).json({
                message: "Library not found"
            });
        }

        const [bookings, payments] = await Promise.all([

            Booking.find({
                library: library._id
            })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("student seat"),

            Payment.find({
                library: library._id
            })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("student booking")

        ]);

        const activities = [];

        bookings.forEach((booking) => {

            activities.push({
                type: "BOOKING",
                title: "New Booking",
                student: booking.student,
                seat: booking.seat,
                status: booking.status,
                createdAt: booking.createdAt
            });

        });

        payments.forEach((payment) => {

            activities.push({
                type: "PAYMENT",
                title:
                    payment.paymentStatus === "REFUNDED"
                        ? "Payment Refunded"
                        : "Payment Received",

                student: payment.student,

                amount: payment.amount,

                paymentMethod: payment.paymentMethod,

                paymentStatus: payment.paymentStatus,

                createdAt: payment.createdAt
            });

        });

        activities.sort(
            (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
        );

        return res.status(200).json({
            message: "Recent activities fetched successfully",
            recentActivities: activities.slice(0, 10)
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: error.message
        });

    }
};