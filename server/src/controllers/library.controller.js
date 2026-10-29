import Library from '../models/library.models.js'
import Seat from "../models/seat.models.js";
import Student from "../models/student.models.js";
import Booking from "../models/booking.models.js";
import Payment from "../models/payment.models.js";
import Expense from "../models/expense.models.js";
import Attendance from "../models/attendance.models.js";

export const createLibrary = async (req, res) => {
    try {
        const { name, openTime, closeTime, address, phone, description, totalSeats } = req.body;
        if (!name || !openTime || !closeTime || !address || !phone || !totalSeats) {
            return res.status(400).json({ message: 'Please fill all required fields' });
        }
        const owner = req.user._id;
        if (!owner) {
            return res.status(400).json({ message: 'Owner is required' });
        }
        const existingLibrary = await Library.findOne({
            owner: req.user._id
        });

        if (existingLibrary) {
            return res.status(409).json({
                message: "Library already exists for this owner"
            });
        }

        const newLibrary = await Library.create({
            name,
            openTime,
            closeTime,
            address,
            phone,
            description,
            totalSeats,
            owner
        });
        return res.status(201).json({
            message: 'Library created successfully',
            library: newLibrary
        });

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


export const getAllLibraries = async (req, res) => {
    try {
        const Libraries = await Library.find().populate('owner', 'name email phone');
        return res.status(200).json({
            message: 'Libraries fetched successfully',
            libraries: Libraries
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


export const getLibraryById = async (req, res) => {
    try {
        const { id } = req.params;
        const library = await Library.findById(id).populate('owner', 'name email phone');
        if (!library) {
            return res.status(404).json({ message: 'Library not found' });
        }
        return res.status(200).json({
            message: 'Library fetched successfully',
            library: library
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const updateLibrary = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, openTime, closeTime, address, phone, upiId, description, totalSeats } = req.body;

        const library = await Library.findById(id);

        if (!library) {
            return res.status(404).json({
                message: "Library not found"
            });
        }

        // Agar SUPER_ADMIN nahi hai to ownership check karo
        if (
            req.user.role !== "SUPER_ADMIN" &&
            library.owner.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                message: "You are not allowed to update this library"
            });
        }

        // Update all fields including name and upiId
        if (name !== undefined && name.trim()) library.name = name.trim();
        if (openTime !== undefined) library.openTime = openTime;
        if (closeTime !== undefined) library.closeTime = closeTime;
        if (address !== undefined && address.trim()) library.address = address.trim();
        if (phone !== undefined && phone.trim()) library.phone = phone.trim();
        if (upiId !== undefined) library.upiId = upiId.trim();
        if (description !== undefined) library.description = description.trim();
        if (totalSeats !== undefined && Number(totalSeats) > 0) library.totalSeats = Number(totalSeats);

        await library.save();

        return res.status(200).json({
            message: "Library updated successfully",
            library
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};


export const deleteLibrary = async (req, res) => {
    try {
        const { id } = req.params;

        const library = await Library.findById(id);

        if (!library) {
            return res.status(404).json({
                message: "Library not found"
            });
        }

        if (
            req.user.role !== "SUPER_ADMIN" &&
            library.owner.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                message: "You are not allowed to delete this library"
            });
        }

        // Cascade delete all associated records to ensure data consistency
        await Promise.all([
            Seat.deleteMany({ library: id }),
            Booking.deleteMany({ library: id }),
            Payment.deleteMany({ library: id }),
            Student.deleteMany({ library: id }),
            Expense.deleteMany({ library: id }),
            Attendance.deleteMany({ library: id }),
            library.deleteOne(),
        ]);

        return res.status(200).json({
            message: "Library and associated data deleted successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};


export const getMyLibrary = async (req, res) => {
  try {
    const library = await Library.findOne({
      owner: req.user._id,
    });

    if (!library) {
      return res.status(404).json({
        message: "Library not found",
      });
    }

    return res.status(200).json({
      message: "Library fetched successfully",
      library,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};




// @desc    Get current subscription plan and seat usage
// @route   GET /api/libraries/subscription
// @access  Private (LIBRARY_OWNER, SUPER_ADMIN)
export const getSubscription = async (req, res) => {
  try {
    const library = await Library.findOne({ owner: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found" });
    }

    const currentSeats = await Seat.countDocuments({ library: library._id });
    const plan = library.subscription || "FREE";
    const maxSeats = plan === "FREE" ? 30 : plan === "PRO" ? 500 : 5000;
    const usagePercent = Math.min(100, Math.round((currentSeats / maxSeats) * 100));

    return res.status(200).json({
      message: "Subscription details retrieved successfully",
      subscription: {
        plan,
        maxSeats,
        currentSeats,
        usagePercent,
        isPro: plan === "PRO" || plan === "ENTERPRISE",
        features:
          plan === "FREE"
            ? [
                "Max 30 Seats",
                "1 Library Location",
                "Standard Booking & Shifts",
                "Basic Manual Billing",
              ]
            : [
                "Unlimited Seats (Up to 500)",
                "Automated WhatsApp Expiry Alerts",
                "Printable Digital Invoices with GST",
                "Revenue & Occupancy Analytics",
                "Priority Support",
              ],
      },
    });
  } catch (error) {
    console.error("getSubscription error:", error);
    return res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// @desc    Upgrade or change subscription plan
// @route   POST /api/libraries/subscription/upgrade
// @access  Private (LIBRARY_OWNER, SUPER_ADMIN)
export const upgradeSubscription = async (req, res) => {
  try {
    const { plan } = req.body;

    if (!["FREE", "PRO", "ENTERPRISE"].includes(plan)) {
      return res.status(400).json({ message: "Invalid subscription plan selected" });
    }

    const library = await Library.findOne({ owner: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found" });
    }

    library.subscription = plan;
    await library.save();

    return res.status(200).json({
      message: `Congratulations! Your library is now on the ${plan} plan.`,
      plan: library.subscription,
    });
  } catch (error) {
    console.error("upgradeSubscription error:", error);
    return res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// @desc    Get WhatsApp message templates and UPI settings
// @route   GET /api/libraries/whatsapp-templates
// @access  Private (LIBRARY_OWNER, SUPER_ADMIN)
export const getWhatsAppTemplates = async (req, res) => {
  try {
    const library = await Library.findOne({ owner: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found" });
    }

    return res.status(200).json({
      message: "WhatsApp templates fetched successfully",
      templates: library.whatsappTemplates || {},
      upiId: library.upiId || "",
      libraryPhone: library.phone || "",
      libraryName: library.name || "",
    });
  } catch (error) {
    console.error("getWhatsAppTemplates error:", error);
    return res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// @desc    Update WhatsApp message templates and UPI settings
// @route   PUT /api/libraries/whatsapp-templates
// @access  Private (LIBRARY_OWNER, SUPER_ADMIN)
export const updateWhatsAppTemplates = async (req, res) => {
  try {
    const { templates, upiId } = req.body;

    const library = await Library.findOne({ owner: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found" });
    }

    if (upiId !== undefined) {
      library.upiId = upiId.trim();
    }

    if (templates) {
      const existing = library.whatsappTemplates?.toObject ? library.whatsappTemplates.toObject() : library.whatsappTemplates;
      library.whatsappTemplates = {
        ...existing,
        ...templates,
      };
      library.markModified("whatsappTemplates");
    }

    await library.save();

    return res.status(200).json({
      message: "WhatsApp templates saved successfully",
      templates: library.whatsappTemplates,
      upiId: library.upiId,
      libraryName: library.name,
      libraryPhone: library.phone,
    });
  } catch (error) {
    console.error("updateWhatsAppTemplates error:", error);
    return res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};