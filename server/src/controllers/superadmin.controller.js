import Library from "../models/library.models.js";
import User from "../models/user.models.js";
import Student from "../models/student.models.js";
import Seat from "../models/seat.models.js";
import Booking from "../models/booking.models.js";
import Payment from "../models/payment.models.js";
import generateToken from "../utils/generateToken.js";
import mongoose from "mongoose";

/**
 * 1. GET PLATFORM SAAS OVERVIEW & EXECUTIVE METRICS
 */
export const getPlatformOverview = async (req, res) => {
  try {
    const [
      totalLibraries,
      activeLibraries,
      suspendedLibraries,
      totalStudents,
      totalSeats,
      totalBookings,
      gmvResult,
      planAgg,
      recentLibraries,
    ] = await Promise.all([
      Library.countDocuments(),
      Library.countDocuments({ status: "ACTIVE" }),
      Library.countDocuments({ status: "INACTIVE" }),
      Student.countDocuments(),
      Seat.countDocuments(),
      Booking.countDocuments(),
      Payment.aggregate([
        { $match: { paymentStatus: "PAID" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Library.aggregate([
        {
          $group: {
            _id: "$subscription",
            count: { $sum: 1 },
          },
        },
      ]),
      Library.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("owner", "name email phone"),
    ]);

    const platformGMV = gmvResult[0]?.total || 0;

    // Calculate Estimated Monthly Recurring Revenue (MRR)
    // Pricing model: FREE: ₹0, PRO: ₹499/mo, ENTERPRISE: ₹1,499/mo
    let estimatedMRR = 0;
    const planCounts = { FREE: 0, PRO: 0, ENTERPRISE: 0 };

    planAgg.forEach((item) => {
      const plan = item._id || "FREE";
      planCounts[plan] = item.count;
      if (plan === "PRO") estimatedMRR += item.count * 499;
      if (plan === "ENTERPRISE") estimatedMRR += item.count * 1499;
    });

    return res.status(200).json({
      message: "Platform overview fetched successfully",
      metrics: {
        totalLibraries,
        activeLibraries,
        suspendedLibraries,
        totalStudents,
        totalSeats,
        totalBookings,
        platformGMV,
        estimatedMRR,
        planCounts,
      },
      recentLibraries,
    });
  } catch (error) {
    console.error("getPlatformOverview error:", error);
    return res.status(500).json({ message: error.message || "Failed to fetch platform metrics" });
  }
};

/**
 * 2. GET ALL TENANT LIBRARIES (With Search, Plan, Status & Enriched Metrics)
 */
export const getAllTenants = async (req, res) => {
  try {
    const { page = 1, limit = 20, plan, status, search } = req.query;

    const query = {};

    if (plan && plan !== "ALL") {
      query.subscription = plan;
    }

    if (status && status !== "ALL") {
      query.status = status;
    }

    if (search) {
      const regex = new RegExp(search.trim(), "i");
      // Search in Library name or address or phone
      query.$or = [{ name: regex }, { address: regex }, { phone: regex }];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [libraries, totalTenants] = await Promise.all([
      Library.find(query)
        .populate("owner", "name email phone role isVerified")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Library.countDocuments(query),
    ]);

    // Enrich each tenant with seats count, students count, and active bookings count
    const enrichedTenants = await Promise.all(
      libraries.map(async (lib) => {
        const [seatsCount, studentsCount, activeBookingsCount, revenueAgg] = await Promise.all([
          Seat.countDocuments({ library: lib._id }),
          Student.countDocuments({ library: lib._id }),
          Booking.countDocuments({ library: lib._id, status: "ACTIVE" }),
          Payment.aggregate([
            { $match: { library: lib._id, paymentStatus: "PAID" } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]),
        ]);

        return {
          ...lib.toObject(),
          seatsCount,
          studentsCount,
          activeBookingsCount,
          totalRevenue: revenueAgg[0]?.total || 0,
        };
      })
    );

    return res.status(200).json({
      message: "Tenants retrieved successfully",
      tenants: enrichedTenants,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalTenants,
        totalPages: Math.ceil(totalTenants / Number(limit)) || 1,
      },
    });
  } catch (error) {
    console.error("getAllTenants error:", error);
    return res.status(500).json({ message: error.message || "Failed to fetch tenants" });
  }
};

/**
 * 3. OVERRIDE TENANT SUBSCRIPTION PLAN (Super Admin Action)
 */
export const updateTenantPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { plan } = req.body;

    if (!["FREE", "PRO", "ENTERPRISE"].includes(plan)) {
      return res.status(400).json({ message: "Invalid subscription plan" });
    }

    const library = await Library.findById(id).populate("owner", "name email");
    if (!library) {
      return res.status(404).json({ message: "Library not found" });
    }

    library.subscription = plan;
    await library.save();

    return res.status(200).json({
      message: `Library "${library.name}" plan updated to ${plan}`,
      library,
    });
  } catch (error) {
    console.error("updateTenantPlan error:", error);
    return res.status(500).json({ message: error.message || "Failed to update tenant plan" });
  }
};

/**
 * 4. TOGGLE TENANT ACTIVE / SUSPENDED STATUS (Super Admin Action)
 */
export const toggleTenantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const library = await Library.findById(id);
    if (!library) {
      return res.status(404).json({ message: "Library not found" });
    }

    library.status = status;
    await library.save();

    return res.status(200).json({
      message: `Library status updated to ${status}`,
      library,
    });
  } catch (error) {
    console.error("toggleTenantStatus error:", error);
    return res.status(500).json({ message: error.message || "Failed to update tenant status" });
  }
};

/**
 * 5. IMPERSONATE TENANT (Generate Owner Session for Support)
 */
export const impersonateTenant = async (req, res) => {
  try {
    const { id } = req.params;

    const library = await Library.findById(id).populate("owner");
    if (!library) {
      return res.status(404).json({ message: "Library not found" });
    }

    if (!library.owner) {
      return res.status(404).json({ message: "No owner associated with this library" });
    }

    const impersonationToken = generateToken(library.owner._id);

    return res.status(200).json({
      message: `Impersonation session created for ${library.name}`,
      token: impersonationToken,
      user: {
        id: library.owner._id,
        name: library.owner.name,
        email: library.owner.email,
        phone: library.owner.phone,
        role: library.owner.role,
        isImpersonated: true,
        impersonatedLibraryName: library.name,
      },
    });
  } catch (error) {
    console.error("impersonateTenant error:", error);
    return res.status(500).json({ message: error.message || "Failed to impersonate tenant" });
  }
};
