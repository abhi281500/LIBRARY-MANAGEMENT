import Payment from "../models/payment.model.js";
import Library from "../models/library.model.js";

export const getYearlyRevenue = async (req, res) => {
    try {

        const library = await Library.findOne({
            owner: req.user._id
        });

        if (!library) {
            return res.status(404).json({
                message: "Library not found"
            });
        }

        const yearlyRevenue = await Payment.aggregate([
            {
                $match: {
                    library: library._id,
                    paymentStatus: "PAID"
                }
            },
            {
                $group: {
                    _id: {
                        $year: "$paymentDate"
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
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id",
                    revenue: 1
                }
            }
        ]);

        return res.status(200).json({
            message: "Yearly revenue fetched successfully",
            yearlyRevenue
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: error.message
        });

    }
};