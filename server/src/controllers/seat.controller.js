import Seat from "../models/seat.models.js";
import Library from "../models/library.models.js";
import mongoose from "mongoose";
import ApiFeatures from "../utils/apifeatures.js";

export const createSeat = async (req, res) => {
  try {
    const { seatNumber, floor, type, status } = req.body;

    if (!seatNumber || floor === undefined || !type || !status) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const library = await Library.findOne({ owner: req.user._id });
    if (!library) {
      return res
        .status(404)
        .json({ message: "Library not found for this owner" });
    }
    const existingSeat = await Seat.findOne({
      seatNumber,
      library: library._id,
    });

    if (existingSeat) {
      return res
        .status(409)
        .json({ message: "Seat number already exists in this library" });
    }
    if (type !== "NORMAL" && type !== "PREMIUM") {
      return res.status(400).json({ message: "Invalid seat type" });
    }
    if (
      status !== "AVAILABLE" &&
      status !== "OCCUPIED" &&
      status !== "MAINTENANCE"
    ) {
      return res.status(400).json({ message: "Invalid seat status" });
    }

    const session = await mongoose.startSession();
    let newSeat;
    try {
      await session.startTransaction();

      newSeat = new Seat({
        seatNumber,
        library: library._id,
        floor,
        type,
        status,
      });
      await newSeat.save({
        session,
      });
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }

    return res.status(201).json({
      message: "Seat created successfully",
      seat: newSeat,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getAllSeats = async (req, res) => {
  try {
    const library = await Library.findOne({ owner: req.user._id });
    if (!library) {
      return res
        .status(404)
        .json({ message: "Library not found for this owner" });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const totalSeats = await Seat.countDocuments({
      library: library._id,
    });

    const features = new ApiFeatures(
      Seat.find({
        library: library._id,
      }),
      req.query,
    )
      .search(["seatNumber"])
      .filter()
      .sort()
      .paginate();

    const seats = await features.query;
    return res.status(200).json({
      message: "seat retrieved successfully",
      pagination: {
        page,
        limit,
        totalSeats,
        totalPages: Math.ceil(totalSeats / limit),
      },
      seats,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getSeatById = async (req, res) => {
  try {
    const { id } = req.params;
    const library = await Library.findOne({ owner: req.user._id });
    if (!library) {
      return res
        .status(404)
        .json({ message: "Library not found for this owner" });
    }

    const seat = await Seat.findOne({ _id: id, library: library._id });
    if (!seat) {
      return res.status(404).json({ message: "Seat not found" });
    }

    return res.status(200).json({
      message: "seat retrieved successfully",
      seat,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const updateSeat = async (req, res) => {
  try {
    const { id } = req.params;
    const { seatNumber, floor, type, status } = req.body;

    const library = await Library.findOne({ owner: req.user._id });
    if (!library) {
      return res
        .status(404)
        .json({ message: "Library not found for this owner" });
    }

    const seat = await Seat.findOne({ _id: id, library: library._id });
    if (!seat) {
      return res.status(404).json({ message: "Seat not found" });
    }
    if (type !== "NORMAL" && type !== "PREMIUM") {
      return res.status(400).json({ message: "Invalid seat type" });
    }
    const existingSeat = await Seat.findOne({
      library: library._id,
      seatNumber,
      _id: { $ne: id },
    });

    if (existingSeat) {
      return res.status(409).json({
        message: "Seat number already exists",
      });
    }

    const session = await mongoose.startSession();
    try {
      await session.startTransaction();

      // Update the seat properties
      seat.floor = floor ?? seat.floor;
      seat.seatNumber = seatNumber ?? seat.seatNumber;
      seat.type = type ?? seat.type;
      seat.status = status ?? seat.status;

      await seat.save({
        session,
      });
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }

    return res.status(200).json({
      message: "Seat updated successfully",
      seat,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const deleteSeat = async (req, res) => {
  try {
    const { id } = req.params;

    const library = await Library.findOne({ owner: req.user._id });
    if (!library) {
      return res
        .status(404)
        .json({ message: "Library not found for this owner" });
    }

    const seat = await Seat.findOne({ _id: id, library: library._id });
    if (!seat) {
      return res.status(404).json({ message: "Seat not found" });
    }
    const activeBooking = await Booking.findOne({
      seat: seat._id,
      status: "ACTIVE",
    });

    if (activeBooking) {
      return res.status(400).json({
        message: "Occupied seat cannot be deleted",
      });
    }
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();
      await seat.deleteOne({
        session,
      });
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }

    return res.status(200).json({ message: "Seat deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
