import Booking from "../models/booking.models.js";
import Student from "../models/student.models.js";
import Seat from "../models/seat.models.js";
import Library from "../models/library.models.js";
import mongoose from "mongoose";
import ApiFeatures from "../utils/apifeatures.js";

export const createBooking = async (req, res) => {

  try {
    const { studentId, seatId, startDate, endDate, amount } = req.body;

    if (
      !studentId ||
      !seatId ||
      !startDate ||
      !endDate ||
      amount === undefined
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
        message: "Library not found",
      });
    }

    // Check student belongs to this library
    const student = await Student.findOne({
      _id: studentId,
      library: library._id,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    // Find seat of this library
    const seat = await Seat.findOne({
      _id: seatId,
      library: library._id,
    });

    if (!seat) {
      return res.status(404).json({
        message: "Seat not found",
      });
    }

    // Seat availability check
    if (seat.status !== "AVAILABLE") {
      return res.status(400).json({
        message: "Seat is not available",
      });
    }
    const existingBooking = await Booking.findOne({
      seat: seat._id,
      library: library._id,
      status: "ACTIVE",
    });

    if (existingBooking) {
      return res.status(409).json({
        message: "Seat already has an active booking",
      });
    }


    const existingStudentBooking = await Booking.findOne({
      student: student._id,
      library: library._id,
      status: "ACTIVE",
    });
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    if (Number(amount) < 0) {
      return res.status(400).json({
        message: "Amount cannot be negative",
      });
    }

    const session = await mongoose.startSession();
    let booking;
    try {
      await session.startTransaction();

      // Create booking
      booking = new Booking({
        student: student._id,
        seat: seat._id,
        library: library._id,
        startDate,
        endDate,
        amount,
        status: "ACTIVE",
      });

      await booking.save({
        session,
      });

      // Update seat status
      seat.status = "OCCUPIED";
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

    return res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const library = await Library.findOne({ owner: req.user._id });
    if (!library) {
      return res
        .status(404)
        .json({ message: "Library not found for this owner" });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const totalBookings = await Booking.countDocuments({
      library: library._id,
    });
    const totalPages = Math.ceil(totalBookings / limit);
    const features = new ApiFeatures(
      Booking.find({
        library: library._id,
      })
        .populate({
          path: "student",
          populate: {
            path: "user",
            select: "name email phone",
          },
        })
        .populate({
          path: "seat",
          select: "seatNumber status",
        }),
      req.query,
    )
      .search(["status"])
      .filter()
      .sort()
      .paginate();

    const bookings = await features.query;

    return res.status(200).json({
      message: "booking retrieved successfully",
      pagination: {
        page,
        limit,
        totalBookings,
        totalPages,
      },
      bookings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "internal server error" });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const library = await Library.findOne({ owner: req.user._id });
    if (!library) {
      return res
        .status(404)
        .json({ message: "Library not found for this owner" });
    }

    const booking = await Booking.findOne({ _id: id, library: library._id })
      .populate({
        path: "student",
        populate: {
          path: "user",
          select: "name email phone",
        },
      })
      .populate({
        path: "seat",
        select: "seatNumber status",
      });

    if (!booking) return res.status(404).json({ message: "booking not found" });

    return res.status(200).json({
      message: "booking retrieved successfully",
      booking,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "internal server error",
    });
  }
};


export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      startDate,
      endDate,
      amount,
    } = req.body;

    const library = await Library.findOne({
      owner: req.user._id,
    });

    if (!library) {
      return res.status(404).json({
        message: "Library not found",
      });
    }

    const booking = await Booking.findOne({
      _id: id,
      library: library._id,
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (amount !== undefined && Number(amount) < 0) {
      return res.status(400).json({
        message: "Amount cannot be negative",
      });
    }

    const newStart = startDate ?? booking.startDate;
    const newEnd = endDate ?? booking.endDate;

    const start = new Date(newStart);
    const end = new Date(newEnd);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid booking dates",
      });
    }

    if (start >= end) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      booking.startDate = start;
      booking.endDate = end;

      if (amount !== undefined) {
        booking.amount = Number(amount);
      }

      await booking.save({ session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }

    return res.status(200).json({
      message: "Booking updated successfully",
      booking,
    });
  } catch (error) {
    console.error("updateBooking error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};



export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const library = await Library.findOne({ owner: req.user._id });
    if (!library) {
      return res
        .status(404)
        .json({ message: "Library not found for this owner" });
    }

    const booking = await Booking.findOne({ _id: id, library: library._id });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    const seat = await Seat.findOne({
      _id: booking.seat,
      library: library._id,
    });

    if (!seat) {
      return res.status(404).json({
        message: "Seat not found",
      });
    }
    if (booking.status === "CANCELLED")
      return res.status(400).json({
        message: "Booking already cancelled",
      });

    const session = await mongoose.startSession();

    try {
      await session.startTransaction();
      booking.status = "CANCELLED";
      seat.status = "AVAILABLE";

      await seat.save({
        session,
      });
      await booking.save({
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
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "internal server error" });
  }
};
