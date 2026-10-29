import Booking from "../models/booking.models.js";
import Student from "../models/student.models.js";
import Seat from "../models/seat.models.js";
import Library from "../models/library.models.js";
import mongoose from "mongoose";
import ApiFeatures from "../utils/apiFeatures.js";

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

    const isAll =
      req.query.limit === "all" ||
      req.query.limit === "ALL" ||
      req.query.limit === "unlimited" ||
      req.query.limit === "0";

    const totalBookings = await Booking.countDocuments({
      library: library._id,
    });

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limitNum = Number(req.query.limit) || 10;
    const limit = isAll ? (totalBookings || 1) : Math.max(limitNum, 1);
    const totalPages = isAll ? 1 : Math.ceil(totalBookings / limit);

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
          select: "seatNumber floor type status",
        }),
      req.query,
    )
      .search(["status", "shift"])
      .filter()
      .sort()
      .paginate();

    const bookings = await features.query;

    return res.status(200).json({
      message: "booking retrieved successfully",
      pagination: {
        page: isAll ? 1 : page,
        limit: isAll ? totalBookings : limit,
        totalBookings,
        totalPages,
        hasNextPage: isAll ? false : page < totalPages,
        hasPrevPage: isAll ? false : page > 1,
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

    let query = { _id: id };
    if (req.user.role !== "SUPER_ADMIN") {
      const library = await Library.findOne({ owner: req.user._id });
      if (!library) {
        return res
          .status(404)
          .json({ message: "Library not found for this owner" });
      }
      query.library = library._id;
    }

    const booking = await Booking.findOne(query)
      .populate({
        path: "student",
        populate: {
          path: "user",
          select: "name email phone",
        },
      })
      .populate({
        path: "seat",
        select: "seatNumber floor type status",
      });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

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
      shift,
    } = req.body;

    let booking;
    if (req.user.role === "SUPER_ADMIN") {
      booking = await Booking.findById(id);
    } else {
      const library = await Library.findOne({
        owner: req.user._id,
      });

      if (!library) {
        return res.status(404).json({
          message: "Library not found",
        });
      }

      booking = await Booking.findOne({
        _id: id,
        library: library._id,
      });
    }

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

    const validShifts = ["MORNING", "EVENING", "FULL_DAY", "NIGHT", "CUSTOM"];
    const targetShift = shift ? (validShifts.includes(shift) ? shift : booking.shift) : booking.shift;

    // Determine conflicting shifts
    let conflictingShifts = [targetShift];
    if (targetShift === "FULL_DAY") {
      conflictingShifts = ["MORNING", "EVENING", "FULL_DAY", "NIGHT", "CUSTOM"];
    } else {
      conflictingShifts = [targetShift, "FULL_DAY"];
    }

    // Check if another active booking exists on this seat with conflicting shift in overlapping date range
    const conflict = await Booking.findOne({
      _id: { $ne: booking._id },
      seat: booking.seat,
      library: booking.library,
      status: "ACTIVE",
      shift: { $in: conflictingShifts },
      startDate: { $lte: end },
      endDate: { $gte: start },
    });

    if (conflict) {
      return res.status(409).json({
        message: `Seat is already booked in ${conflict.shift} shift for overlapping dates`,
      });
    }

    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      booking.startDate = start;
      booking.endDate = end;
      booking.shift = targetShift;

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

    let booking;
    if (req.user.role === "SUPER_ADMIN") {
      booking = await Booking.findById(id);
    } else {
      const library = await Library.findOne({ owner: req.user._id });
      if (!library) {
        return res
          .status(404)
          .json({ message: "Library not found for this owner" });
      }
      booking = await Booking.findOne({ _id: id, library: library._id });
    }

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    const seat = await Seat.findById(booking.seat);

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

export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    let booking;
    if (req.user.role === "SUPER_ADMIN") {
      booking = await Booking.findById(id);
    } else {
      const library = await Library.findOne({ owner: req.user._id });
      if (!library) {
        return res.status(404).json({ message: "Library not found for this owner" });
      }
      booking = await Booking.findOne({ _id: id, library: library._id });
    }

    if (!booking) {
      return res.status(404).json({ message: "Booking record not found" });
    }

    const seatId = booking.seat;
    await Booking.findByIdAndDelete(id);

    // Free up seat if no other active booking remains on this desk
    if (seatId) {
      const remainingActive = await Booking.findOne({
        seat: seatId,
        status: "ACTIVE",
        endDate: { $gte: new Date() },
      });
      if (!remainingActive) {
        await Seat.findByIdAndUpdate(seatId, { status: "AVAILABLE" });
      }
    }

    return res.status(200).json({
      message: "Booking record deleted successfully.",
    });
  } catch (error) {
    console.error("deleteBooking error:", error);
    return res.status(500).json({ message: error.message || "Failed to delete booking" });
  }
};

export const cleanupExpiredBookings = async (req, res) => {
  try {
    const library = await Library.findOne({ owner: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found for this owner" });
    }

    const now = new Date();
    const expiredList = await Booking.find({
      library: library._id,
      $or: [
        { status: "COMPLETED" },
        { status: "CANCELLED" },
        { endDate: { $lt: now } },
      ],
    });

    if (expiredList.length === 0) {
      return res.status(200).json({
        message: "No expired or inactive bookings to clean up.",
        deletedCount: 0,
      });
    }

    const seatIds = new Set();
    const bookingIds = [];
    for (const b of expiredList) {
      bookingIds.push(b._id);
      if (b.seat) seatIds.add(b.seat.toString());
    }

    await Booking.deleteMany({ _id: { $in: bookingIds } });

    for (const seatId of seatIds) {
      const remainingActive = await Booking.findOne({
        seat: seatId,
        status: "ACTIVE",
        endDate: { $gte: now },
      });
      if (!remainingActive) {
        await Seat.findByIdAndUpdate(seatId, { status: "AVAILABLE" });
      }
    }

    return res.status(200).json({
      message: `Cleaned up ${bookingIds.length} expired/completed booking records successfully.`,
      deletedCount: bookingIds.length,
    });
  } catch (error) {
    console.error("cleanupExpiredBookings error:", error);
    return res.status(500).json({ message: error.message || "Failed to clean up expired bookings" });
  }
};
