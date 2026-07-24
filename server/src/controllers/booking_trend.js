import Booking from "../models/booking.model.js";
import Library from "../models/library.model.js";

export const getBookingTrends = async (req, res) => {
    try {

        const { year } = req.query;

        const selectedYear = Number(year) || new Date().getFullYear();

        const library = await Library.findOne({
            owner: req.user._id
        });

        if (!library) {
            return res.status(404).json({
                message: "Library not found"
            });
        }

        const bookings = await Booking.aggregate([
            {
                $match: {
                    library: library._id,
                    createdAt: {
                        $gte: new Date(`${selectedYear}-01-01`),
                        $lt: new Date(`${selectedYear + 1}-01-01`)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" }
                    },
                    totalBookings: {
                        $sum: 1
                    },
                    activeBookings: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "ACTIVE"] },
                                1,
                                0
                            ]
                        }
                    },
                    cancelledBookings: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "CANCELLED"] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $sort: {
                    "_id.month": 1
                }
            }
        ]);

        const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ];

        const bookingTrends = months.map((month, index) => {

            const data = bookings.find(
                item => item._id.month === index + 1
            );

            return {
                month,
                totalBookings: data ? data.totalBookings : 0,
                activeBookings: data ? data.activeBookings : 0,
                cancelledBookings: data ? data.cancelledBookings : 0
            };

        });

        return res.status(200).json({
            message: "Booking trends fetched successfully",
            year: selectedYear,
            bookingTrends
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: error.message
        });

    }
};