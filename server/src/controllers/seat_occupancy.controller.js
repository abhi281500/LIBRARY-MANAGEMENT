import Seat from "../models/seat.model.js";
import Library from "../models/library.model.js";

export const getSeatOccupancy = async (req, res) => {
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
            totalSeats,
            occupiedSeats,
            availableSeats,
            maintenanceSeats
        ] = await Promise.all([

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
            })

        ]);

        const occupancyRate =
            totalSeats === 0
                ? 0
                : Number(
                    ((occupiedSeats / totalSeats) * 100).toFixed(2)
                );

        return res.status(200).json({

            message: "Seat occupancy fetched successfully",

            seatOccupancy: {

                totalSeats,

                occupiedSeats,

                availableSeats,

                maintenanceSeats,

                occupancyRate

            }

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: error.message
        });

    }
};