import Booking from "../models/booking.models.js";
import Student from "../models/student.models.js";
import Seat from "../models/seat.models.js";
import Library from "../models/library.models.js";
import mongoose from "mongoose";
import ApiFeatures from "../utils/apifeatures.js";

export const createBooking = async (req, res) => {
  try {
    const { studentId, seatId, startDate, endDate, amount, shift = "FULL_DAY" } = req.body;

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

    const validShifts = ["MORNING", "EVENING", "FULL_DAY", "NIGHT", "CUSTOM"];
    const chosenShift = validShifts.includes(shift) ? shift : "FULL_DAY";

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
        message: "Student not found in your library",
      });
    }

    // Find seat of this library
    const seat = await Seat.findOne({
      _id: seatId,
      library: library._id,
    });

    if (!seat) {
      return res.status(404).json({
        message: "Seat not found in your library",
      });
    }

    if (seat.status === "MAINTENANCE") {
      return res.status(400).json({
        message: "Seat is currently under maintenance",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    if (Number(amount) < 0) {
      return res.status(400).json({
        message: "Amount cannot be negative",
      });
    }

    // Determine conflicting shifts
    let conflictingShifts = [chosenShift];
    if (chosenShift === "FULL_DAY") {
      conflictingShifts = ["MORNING", "EVENING", "FULL_DAY", "NIGHT", "CUSTOM"];
    } else {
      conflictingShifts = [chosenShift, "FULL_DAY"];
    }

    // Check if seat is already booked for conflicting shifts in overlapping date range
    const existingBooking = await Booking.findOne({
      seat: seat._id,
      library: library._id,
      status: "ACTIVE",
      shift: { $in: conflictingShifts },
      startDate: { $lte: end },
      endDate: { $gte: start },
    });

    if (existingBooking) {
      return res.status(409).json({
        message: `Seat is already booked in ${existingBooking.shift} shift for overlapping dates`,
      });
    }

    // Check if student already has active booking in this shift during this period
    const existingStudentBooking = await Booking.findOne({
      student: student._id,
      library: library._id,
      status: "ACTIVE",
      shift: { $in: conflictingShifts },
      startDate: { $lte: end },
      endDate: { $gte: start },
    });

    if (existingStudentBooking) {
      return res.status(409).json({
        message: "Student already has an active booking in this shift/period",
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
        startDate: start,
        endDate: end,
        shift: chosenShift,
        amount,
        status: "ACTIVE",
      });

      await booking.save({
        session,
      });

      // Update seat status to OCCUPIED
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
      message: error.message || "Failed to create booking",
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
      await booking.save({
        session,
      });

      if (seat) {
        const otherActiveBookings = await Booking.countDocuments({
          seat: seat._id,
          _id: { $ne: booking._id },
          status: "ACTIVE",
          endDate: { $gte: new Date() },
        });

        if (otherActiveBookings === 0 && seat.status !== "MAINTENANCE") {
          seat.status = "AVAILABLE";
          await seat.save({
            session,
          });
        }
      }

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
