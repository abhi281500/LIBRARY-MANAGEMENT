import Payment from "../models/payment.models.js";
import Booking from "../models/booking.models.js";
import Library from "../models/library.models.js";
import Seat from "../models/seat.models.js";
import mongoose from "mongoose";
import ApiFeatures from "../utils/apiFeatures.js";


export const createPayment = async (req, res) => {
  try {
    const {
      bookingId,
      paymentMethod,
    } = req.body;

    if (!bookingId || !paymentMethod) {
      return res.status(400).json({
        message: "Booking and payment method are required",
      });
    }

    const library = await Library.findOne({
      owner: req.user._id,
    });

    if (!library) {
      return res.status(404).json({
        message: "Library not found",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      library: library._id,
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Only active bookings can be paid",
      });
    }

    const existingPayment = await Payment.findOne({
      booking: booking._id,
      paymentStatus: "PAID",
    });

    if (existingPayment) {
      return res.status(409).json({
        message: "Payment already exists for this booking",
      });
    }

    const receiptNumber = `PAY-${Date.now()}`;

    const session = await mongoose.startSession();

    let newPayment;

    try {
      await session.startTransaction();

      newPayment = new Payment({
        booking: booking._id,
        student: booking.student,
        library: booking.library,
        amount: booking.amount,
        paymentMethod,
        paymentStatus: "PAID",
        paymentDate: new Date(),
        receiptNumber,
      });

      await newPayment.save({ session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }

    return res.status(201).json({
      message: "Payment created successfully",
      payment: newPayment,
    });
  } catch (error) {
    console.error("createPayment error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


export const getAllPayments = async (req, res) => {
  try {
    const library = await Library.findOne({ owner: req.user._id });
    if (!library) {
      return res
        .status(404)
        .json({ message: "Library not found for this owner" });
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const totalPayments = await Payment.countDocuments({
      library: library._id,
    });

    const features = new ApiFeatures(
      Payment.find({
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
          path: "booking",
          select: "shift startDate endDate amount status",
          populate: {
            path: "seat",
            select: "seatNumber floor type",
          },
        }),
      req.query,
    )
      .search([
        "amount",
        "paymentMethod",
        "paymentStatus",
        "paymentDate",
        "receiptNumber",
      ])
      .filter()
      .sort()
      .paginate();

    const payments = await features.query;
    return res.status(200).json({
      message: "payment retrieved successfully",
      pagination: {
        page,
        limit,
        totalPayments,
        totalPages: Math.ceil(totalPayments / limit),
      },
      payments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const library = await Library.findOne({ owner: req.user._id });
    if (!library) {
      return res
        .status(404)
        .json({ message: "Library not found for this owner" });
    }

    const payment = await Payment.findOne({
  _id: id,
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
  path: "booking",
  populate: {
    path: "seat",
    select: "seatNumber",
  },
})
.populate({
  path: "library",
  select: "name address",
});

    if (!payment)
      return res.status(404).json({
        message: "payment not found",
      });
    return res.status(200).json({
      message: "payment retrieved successfully",
      payment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;
    const library = await Library.findOne({ owner: req.user._id });
    if (!library) {
      return res
        .status(404)
        .json({ message: "Library not found for this owner" });
    }

    const payment = await Payment.findOne({ _id: id, library: library._id })
      .populate("student")
      .populate("booking");
    if (!payment)
      return res.status(404).json({
        message: "payment not found",
      });

    const session = await mongoose.startSession();

    try {
      await session.startTransaction();
      payment.paymentMethod = paymentMethod ?? payment.paymentMethod;

      await payment.save({
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
      message: "payment updated successfully",
      payment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};
export const refundPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const library = await Library.findOne({
      owner: req.user._id,
    });

    if (!library) {
      return res.status(404).json({
        message: "Library not found",
      });
    }

    const payment = await Payment.findOne({
      _id: id,
      library: library._id,
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    if (payment.paymentStatus === "REFUNDED") {
      return res.status(400).json({
        message: "Payment is already refunded",
      });
    }

    if (payment.paymentStatus !== "PAID") {
      return res.status(400).json({
        message: "Only paid payments can be refunded",
      });
    }

    const booking = await Booking.findOne({
      _id: payment.booking,
      library: library._id,
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
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

    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      payment.paymentStatus = "REFUNDED";
      payment.refundDate = new Date();

      booking.status = "CANCELLED";

      seat.status = "AVAILABLE";

      await payment.save({ session });
      await booking.save({ session });
      await seat.save({ session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }

    return res.status(200).json({
      message: "Payment refunded successfully",
      payment,
    });
  } catch (error) {
    console.error("refundPayment error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
