import Student from "../models/student.models.js";
import User from "../models/user.models.js";
import Library from "../models/library.models.js";
import Booking from "../models/booking.models.js";
import Payment from "../models/payment.models.js";
import ApiFeatures from "../utils/apiFeatures.js";
import mongoose from "mongoose";

export const createStudent = async (req, res) => {
  try {
    const { name, email, password, phone, admissionNumber ,joiningDate,status} = req.body;

    // 1. Validation
    if (!name || !email || !password || !phone || !admissionNumber  ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    // 2. Check email already exists
    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // 3. Find library of logged in owner
    const library = await Library.findOne({
      owner: req.user._id,
    });

    if (!library) {
      return res.status(404).json({
        message: "Library not found for this owner",
      });
    }

    const session = await mongoose.startSession();

    let student;

    try {
      session.startTransaction();

      const newUser = await User.create(
        [
          {
            name,
            email: email.trim().toLowerCase(),
            password,
            phone,
            role: "STUDENT",
          },
        ],
        { session },
      );

      student = await Student.create(
        [
          {
            user: newUser[0]._id,
            library: library._id,
            admissionNumber,
            joiningDate,
            status,
          },
        ],
        { session },
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }

    return res.status(201).json({
      message: "Student created successfully",
      student: student[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};


export const getAllStudents = async (req, res) => {
  try {
    // --------------------------------------------------
    // 1. Find library of logged-in owner
    // --------------------------------------------------
    const library = await Library.findOne({
      owner: req.user._id,
    });

    if (!library) {
      return res.status(404).json({
        success: false,
        message: "Library not found for this owner",
      });
    }

    // --------------------------------------------------
    // 2. Pagination
    // --------------------------------------------------
    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      100
    );

    const skip = (page - 1) * limit;

    // --------------------------------------------------
    // 3. Query params
    // --------------------------------------------------
    const search = req.query.search?.trim() || "";
    const status = req.query.status?.trim() || "ALL";

    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // --------------------------------------------------
    // 4. Build Student filter
    // --------------------------------------------------
    const studentFilter = {
      library: library._id,
    };

    // --------------------------------------------------
    // 5. Status filter
    // --------------------------------------------------
    if (status !== "ALL") {
      studentFilter.status = status;
    }

    // --------------------------------------------------
    // 6. Search
    //
    // Search:
    // - Admission Number
    // - Student Name
    // - Email
    // - Phone
    // --------------------------------------------------
    if (search) {
      const searchRegex = new RegExp(search, "i");

      const matchingUsers = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
        ],
      }).select("_id");

      const userIds = matchingUsers.map((user) => user._id);

      studentFilter.$or = [
        {
          admissionNumber: searchRegex,
        },
        {
          user: {
            $in: userIds,
          },
        },
      ];
    }

    // --------------------------------------------------
    // 7. Count filtered students
    // --------------------------------------------------
    const totalStudents = await Student.countDocuments(
      studentFilter
    );

    const totalPages = Math.ceil(totalStudents / limit);

    // --------------------------------------------------
    // 8. Prevent page from going beyond available pages
    // --------------------------------------------------
    const safePage =
      totalPages > 0
        ? Math.min(page, totalPages)
        : 1;

    const safeSkip = (safePage - 1) * limit;

    // --------------------------------------------------
    // 9. Fetch students
    // --------------------------------------------------
    const students = await Student.find(studentFilter)
      .populate("user", "name email phone")
      .populate("library", "name address")
      .sort({
        [sortBy]: sortOrder,
      })
      .skip(safeSkip)
      .limit(limit)
      .lean();

    // --------------------------------------------------
    // 10. Response
    // --------------------------------------------------
    return res.status(200).json({
      success: true,
      message: "Students retrieved successfully",

      pagination: {
        page: safePage,
        limit,
        totalStudents,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1,
      },

      filters: {
        search,
        status,
        sortBy,
        sortOrder: sortOrder === 1 ? "asc" : "desc",
      },

      students,
    });
  } catch (error) {
    console.error("getAllStudents error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve students",
    });
  }
};


export const getStudentById = async (req, res) => {
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
    const student = await Student.findOne({ _id: id, library: library._id })
      .populate("user", "name email phone")
      .populate("library", "name address phone openTime closeTime");

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const bookings = await Booking.find({
      student: student._id,
      library: library._id,
    })
      .populate("seat", "seatNumber floor type")
      .sort({ createdAt: -1 });

    const activeBooking = bookings.find((b) => b.status === "ACTIVE") || null;

    const payments = await Payment.find({
      student: student._id,
      library: library._id,
    }).sort({ paymentDate: -1, createdAt: -1 });

    return res.status(200).json({
      message: "Student retrieved successfully",
      student,
      activeBooking,
      bookings,
      payments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, admissionNumber,joiningDate,status } = req.body;

    const library = await Library.findOne({
      owner: req.user._id,
    });

    if (!library) {
      return res.status(404).json({
        message: "Library not found for this owner",
      });
    }

    const student = await Student.findOne({ _id: id, library: library._id });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const user = await User.findById(student.user);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const existingUser = await User.findOne({
      email,
      _id: { $ne: user._id },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      user.name = name || user.name;
      user.email = email || user.email;
      user.phone = phone || user.phone;

      if (email) {
        user.email = email.trim().toLowerCase();
      }

      await user.save({
        session,
      });

      student.admissionNumber = admissionNumber || student.admissionNumber;
      student.joiningDate = joiningDate || student.joiningDate;
      student.status = status || student.status;
      await student.save({
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
      message: "Student updated successfully",
      student,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteStudent = async (req, res) => {
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

    const student = await Student.findOne({ _id: id, library: library._id });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      await User.findByIdAndDelete(student.user).session(session);
      await Student.findByIdAndDelete(id).session(session);

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }

    return res.status(200).json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};


