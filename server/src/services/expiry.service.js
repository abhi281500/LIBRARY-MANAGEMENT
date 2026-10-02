import Booking from "../models/booking.models.js";
import Seat from "../models/seat.models.js";

/**
 * Automatically find expired active bookings and mark them as COMPLETED.
 * Also frees up seats that have no remaining active bookings.
 */
export const processExpiredBookings = async () => {
  try {
    const now = new Date();

    const expiredBookings = await Booking.find({
      status: "ACTIVE",
      endDate: { $lt: now },
    });

    if (expiredBookings.length === 0) {
      return { updatedCount: 0 };
    }

    console.log(`[Auto-Expiry] Found ${expiredBookings.length} expired bookings.`);

    const seatIdsToCheck = new Set();

    for (const booking of expiredBookings) {
      booking.status = "COMPLETED";
      await booking.save();
      if (booking.seat) {
        seatIdsToCheck.add(booking.seat.toString());
      }
    }

    // Free up seats if no other active booking exists on that seat
    for (const seatId of seatIdsToCheck) {
      const remainingActive = await Booking.findOne({
        seat: seatId,
        status: "ACTIVE",
        endDate: { $gte: now },
      });

      if (!remainingActive) {
        await Seat.findByIdAndUpdate(seatId, { status: "AVAILABLE" });
      }
    }

    console.log(`[Auto-Expiry] Successfully processed ${expiredBookings.length} expired bookings.`);
    return { updatedCount: expiredBookings.length };
  } catch (error) {
    console.error("[Auto-Expiry Error]:", error);
    throw error;
  }
};


/**
 * Get expired + currently expiring bookings
 * for a specific library.
 */
export const getExpiringBookings = async (libraryId, days = 3) => {
  try {
    const now = new Date();

    const threshold = new Date();
    threshold.setDate(threshold.getDate() + days);

    const expiring = await Booking.find({
      library: libraryId,

      // Cancelled bookings ko dashboard par nahi dikhana
      status: { $ne: "CANCELLED" },

      // Past expired + today + next N days
      endDate: {
        $lte: threshold,
      },
    })
      .populate({
        path: "student",
        populate: {
          path: "user",
          select: "name email phone",
        },
      })
      .populate("seat", "seatNumber floor type")
      .sort({ endDate: 1 });

    return expiring;
  } catch (error) {
    console.error("getExpiringBookings error:", error);
    throw error;
  }
};
