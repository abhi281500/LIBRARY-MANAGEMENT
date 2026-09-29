import Student from "../models/student.models.js";
import Seat from "../models/seat.models.js";
import Booking from "../models/booking.models.js";
import Payment from "../models/payment.models.js";
import Library from "../models/library.models.js";

import { getExpiringBookings, processExpiredBookings } from "../services/expiry.service.js";

export const getExpiringSoonBookings = async (req, res) => {
    try {
        const library = await Library.findOne({ owner: req.user._id });
        if (!library) {
            return res.status(404).json({ message: "Library not found" });
        }

        const days = Number(req.query.days) || 3;
        const expiringBookings = await getExpiringBookings(library._id, days);

        return res.status(200).json({
            message: `Retrieved bookings expiring within ${days} days`,
            count: expiringBookings.length,
            expiringBookings,
        });
    } catch (error) {
        console.error("getExpiringSoonBookings error:", error);
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const triggerExpiryCheck = async (req, res) => {
    try {
        const result = await processExpiredBookings();
        return res.status(200).json({
            message: "Expiry check executed successfully",
            ...result,
        });
    } catch (error) {
        console.error("triggerExpiryCheck error:", error);
        return res.status(500).json({ message: error.message || "Failed to process expired bookings" });
    }
};

export const getDashboard = async (req, res) => {
    try {

        const library = await Library.findOne({
            owner: req.user._id
        });

        if (!library) {
            return res.status(404).json({
                message: "Library not found"
            });
        }

        const [
            totalStudents,
            totalSeats,
            occupiedSeats,
            availableSeats,
            maintenanceSeats,
            activeBookings,
            cancelledBookings,
            refundedPayments,
            recentBookings,
            recentPayments
        ] = await Promise.all([

            Student.countDocuments({
                library: library._id
            }),

            Seat.countDocuments({
                library: library._id
            }),

            Seat.countDocuments({
                library: library._id,
                status: "OCCUPIED"
            }),

            Seat.countDocuments({
                library: library._id,
                status: "AVAILABLE"
            }),

            Seat.countDocuments({
                library: library._id,
                status: "MAINTENANCE"
            }),

            Booking.countDocuments({
                library: library._id,
                status: "ACTIVE"
            }),

            Booking.countDocuments({
                library: library._id,
                status: "CANCELLED"
            }),

            Payment.countDocuments({
                library: library._id,
                paymentStatus: "REFUNDED"
            }),

            Booking.find({ library: library._id })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate({
                    path: "student",
                    populate: { path: "user", select: "name email phone" }
                })
                .populate("seat", "seatNumber floor type"),

            Payment.find({ library: library._id })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate({
                    path: "student",
                    populate: { path: "user", select: "name email phone" }
                })
                .populate({
                    path: "booking",
                    populate: { path: "seat", select: "seatNumber" }
                })
        ]);

        const totalRevenueResult = await Payment.aggregate([
            {
                $match: {
                    library: library._id,
                    paymentStatus: "PAID"
                }
            },
            {
                $group: {
                    _id: null,
                    revenue: {
                        $sum: "$amount"
                    }
                }
            }
        ]);

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const todayRevenueResult = await Payment.aggregate([
            {
                $match: {
                    library: library._id,
                    paymentStatus: "PAID",
                    paymentDate: {
                        $gte: startOfToday
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    revenue: {
                        $sum: "$amount"
                    }
                }
            }
        ]);

        const totalRevenue =
            totalRevenueResult.length > 0
                ? totalRevenueResult[0].revenue
                : 0;

        const todayRevenue =
            todayRevenueResult.length > 0
                ? todayRevenueResult[0].revenue
                : 0;

        const occupancyRate =
            totalSeats === 0
                ? 0
                : Number(((occupiedSeats / totalSeats) * 100).toFixed(2));

        return res.status(200).json({

            message: "Dashboard fetched successfully",

            statistics: {

                totalStudents,

                totalSeats,

                occupiedSeats,

                availableSeats,

                maintenanceSeats,

                occupancyRate,

                activeBookings,

                cancelledBookings,

                totalRevenue,

                todayRevenue,

                refundedPayments

            },

            recentBookings,

            recentPayments

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: error.message
        });

    }
};