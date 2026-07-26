import Payment from "../models/payment.models.js";
import Library from "../models/library.models.js";

export const getMonthlyRevenue = async (req, res) => {
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

        const revenue = await Payment.aggregate([
            {
                $match: {
                    library: library._id,
                    paymentStatus: "PAID",
                    paymentDate: {
                        $gte: new Date(`${selectedYear}-01-01`),
                        $lt: new Date(`${selectedYear + 1}-01-01`)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $month: "$paymentDate"
                    },
                    revenue: {
                        $sum: "$amount"
                    }
                }
            },
            {
                $sort: {
                    _id: 1
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

        const monthlyRevenue = months.map((month, index) => {

            const data = revenue.find(item => item._id === index + 1);

            return {
                month,
                revenue: data ? data.revenue : 0
            };

        });

        return res.status(200).json({
            year: selectedYear,
            monthlyRevenue
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: error.message
        });

    }
};