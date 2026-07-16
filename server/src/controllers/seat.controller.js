import Seat from "../models/seat.model.js";
import Library from "../models/library.model.js";

export const createSeat = async (req, res) => {
    try {
        const { seatNumber, floor, type, status } = req.body;

        if (!seatNumber || floor === undefined || !type || !status) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const library = await Library.findOne({ owner: req.user._id });
        if (!library) {
            return res.status(404).json({ message: "Library not found for this owner" });
        }
        const existingSeat = await Seat.findOne({
            seatNumber,
            library: library._id
        });

        if (existingSeat) {
            return res.status(409).json({ message: "Seat number already exists in this library" });
        }
        if (type !== "NORMAL" && type !== "PREMIUM") {
            return res.status(400).json({ message: "Invalid seat type" });
        }
        if (status !== "AVAILABLE" && status !== "OCCUPIED" && status !== "MAINTENANCE") {
            return res.status(400).json({ message: "Invalid seat status" });
        }



        const newSeat = await Seat.create({
            seatNumber,
            library: library._id,
            floor,
            type,
            status
        });
        return res.status(201).json({
            message: "Seat created successfully",
            seat: newSeat
        });



    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

export const getAllSeats = async (req, res) => {
    try {
        const library = await Library.findOne({ owner: req.user._id });
        if (!library) {
            return res.status(404).json({ message: "Library not found for this owner" });
        }

        const seats = await Seat.find({ library: library._id });
        return res.status(200).json({
            message : "seat retrieved successfully",
             seats 
            });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

export const getSeatById = async (req, res) => {
    try {
        const { id } = req.params;
        const library = await Library.findOne({ owner: req.user._id });
        if (!library) {
            return res.status(404).json({ message: "Library not found for this owner" });
        }

        const seat = await Seat.findOne({ _id: id, library: library._id });
        if (!seat) {
            return res.status(404).json({ message: "Seat not found" });
        }

        return res.status(200).json({
            message :"seat retrieved successfully",
             seat 
            });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

export const updateSeat = async (req, res) => {
    try {
        const { id } = req.params;
        const { seatNumber, floor, type, status } = req.body;

        const library = await Library.findOne({ owner: req.user._id });
        if (!library) {
            return res.status(404).json({ message: "Library not found for this owner" });
        }

        const seat = await Seat.findOne({ _id: id, library: library._id });
        if (!seat) {
            return res.status(404).json({ message: "Seat not found" });
        }

        const existingSeat = await Seat.findOne({
            library: library._id,
            seatNumber,
            _id: { $ne: id }
        });

        if (existingSeat) {
            return res.status(409).json({
                message: "Seat number already exists"
            });
        }
        // Update the seat properties
        seat.floor = floor ?? seat.floor;
        seat.seatNumber = seatNumber ?? seat.seatNumber;
        seat.type = type ?? seat.type;
        seat.status = status ?? seat.status;

        await seat.save();
        return res.status(200).json({
             message: "Seat updated successfully",
             seat 
            });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

export const deleteSeat = async (req, res) => {
    try {
        const { id } = req.params;

        const library = await Library.findOne({ owner: req.user._id });
        if (!library) {
            return res.status(404).json({ message: "Library not found for this owner" });
        }

        const seat = await Seat.findOne({ _id: id, library: library._id });
        if (!seat) {
            return res.status(404).json({ message: "Seat not found" });
        }

        await seat.deleteOne();
        return res.status(200).json({ message: "Seat deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}