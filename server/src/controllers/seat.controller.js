import Seat from "../models/seat.models.js";
import Booking from "../models/booking.models.js";
import Library from "../models/library.models.js";
import mongoose from "mongoose";
import ApiFeatures from "../utils/apifeatures.js";




export const createSeat = async (req, res) => {
  try {
    const {
      seatNumber,
      floor,
      type,
      status,
    } = req.body;

    // Required fields
    if (
      !seatNumber ||
      floor === undefined ||
      !type ||
      !status
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Find owner's library
    const library = await Library.findOne({
      owner: req.user._id,
    });

    if (!library) {
      return res.status(404).json({
        message: "Library not found for this owner",
      });
    }

    // Check duplicate seat number inside same library
    const existingSeat = await Seat.findOne({
      seatNumber: seatNumber.trim(),
      library: library._id,
    });

    if (existingSeat) {
      return res.status(409).json({
        message: "Seat number already exists in this library",
      });
    }

    // Validate seat type
    if (
      type !== "NORMAL" &&
      type !== "PREMIUM"
    ) {
      return res.status(400).json({
        message: "Invalid seat type",
      });
    }

    // Validate seat status
    if (
      status !== "AVAILABLE" &&
      status !== "OCCUPIED" &&
      status !== "MAINTENANCE"
    ) {
      return res.status(400).json({
        message: "Invalid seat status",
      });
    }

    const session = await mongoose.startSession();

    let newSeat;

    try {
      await session.startTransaction();

      newSeat = new Seat({
        seatNumber: seatNumber.trim(),
        library: library._id,
        floor,
        type,
        status,
      });

      await newSeat.save({ session });

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
    console.error("createSeat error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};



export const getAllSeats = async (req, res) => {
  try {
    // Find owner's library
    const library = await Library.findOne({
      owner: req.user._id,
    });

    if (!library) {
      return res.status(404).json({
        message: "Library not found for this owner",
      });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    // Total seats
    const totalSeats = await Seat.countDocuments({
      library: library._id,
    });

    const features = new ApiFeatures(
      Seat.find({
        library: library._id,
      }),
      req.query
    )
      .search(["seatNumber"])
      .filter()
      .sort()
      .paginate();

    const seats = await features.query;

    return res.status(200).json({
      message: "Seats retrieved successfully",

      pagination: {
        page,
        limit,
        totalSeats,
        totalPages: Math.ceil(
          totalSeats / limit
        ),
      },

      seats,
    });
  } catch (error) {
    console.error("getAllSeats error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};



export const getSeatById = async (req, res) => {
  try {
    const { id } = req.params;

    const library = await Library.findOne({
      owner: req.user._id,
    });

    if (!library) {
      return res.status(404).json({
        message: "Library not found for this owner",
      });
    }

    const seat = await Seat.findOne({
      _id: id,
      library: library._id,
    });

    if (!seat) {
      return res.status(404).json({
        message: "Seat not found",
      });
    }

    return res.status(200).json({
      message: "Seat retrieved successfully",
      seat,
    });
  } catch (error) {
    console.error("getSeatById error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};



export const updateSeat = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      seatNumber,
      floor,
      type,
      status,
    } = req.body;

    // Find owner's library
    const library = await Library.findOne({
      owner: req.user._id,
    });

    if (!library) {
      return res.status(404).json({
        message: "Library not found for this owner",
      });
    }

    // Find seat belonging to this library
    const seat = await Seat.findOne({
      _id: id,
      library: library._id,
    });

    if (!seat) {
      return res.status(404).json({
        message: "Seat not found",
      });
    }

    // Validate only if type is provided
    if (
      type !== undefined &&
      type !== "NORMAL" &&
      type !== "PREMIUM"
    ) {
      return res.status(400).json({
        message: "Invalid seat type",
      });
    }

    // Validate only if status is provided
    if (
      status !== undefined &&
      status !== "AVAILABLE" &&
      status !== "OCCUPIED" &&
      status !== "MAINTENANCE"
    ) {
      return res.status(400).json({
        message: "Invalid seat status",
      });
    }

    // Check duplicate seat number only
    // when a new seat number is being provided
    if (
      seatNumber !== undefined &&
      seatNumber.trim() !== ""
    ) {
      const existingSeat = await Seat.findOne({
        library: library._id,
        seatNumber: seatNumber.trim(),
        _id: { $ne: id },
      });

      if (existingSeat) {
        return res.status(409).json({
          message: "Seat number already exists in this library",
        });
      }
    }

    // If trying to make an actively booked seat AVAILABLE
    if (status === "AVAILABLE") {
      const activeBooking = await Booking.findOne({
        seat: seat._id,
        status: "ACTIVE",
      });

      if (activeBooking) {
        return res.status(400).json({
          message:
            "Seat has an active booking and cannot be marked available",
        });
      }
    }

    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      // Update only supplied fields
      if (seatNumber !== undefined) {
        seat.seatNumber = seatNumber.trim();
      }

      if (floor !== undefined) {
        seat.floor = floor;
      }

      if (type !== undefined) {
        seat.type = type;
      }

      if (status !== undefined) {
        seat.status = status;
      }

      await seat.save({ session });

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
    console.error("updateSeat error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};



export const deleteSeat = async (req, res) => {
  try {
    const { id } = req.params;

    // Find owner's library
    const library = await Library.findOne({
      owner: req.user._id,
    });

    if (!library) {
      return res.status(404).json({
        message: "Library not found for this owner",
      });
    }

    // Find seat belonging to this library
    const seat = await Seat.findOne({
      _id: id,
      library: library._id,
    });

    if (!seat) {
      return res.status(404).json({
        message: "Seat not found",
      });
    }

    // Don't allow deleting seat with active booking
    const activeBooking = await Booking.findOne({
      seat: seat._id,
      status: "ACTIVE",
    });

    if (activeBooking) {
      return res.status(400).json({
        message:
          "Occupied seat cannot be deleted",
      });
    }

    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      await seat.deleteOne({ session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }

    return res.status(200).json({
      message: "Seat deleted successfully",
    });
  } catch (error) {
    console.error("deleteSeat error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};