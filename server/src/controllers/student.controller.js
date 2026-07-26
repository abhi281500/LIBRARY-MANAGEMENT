import Student from "../models/student.models.js";
import User from "../models/user.models.js";
import Library from "../models/library.models.js";
import ApiFeatures from "../utils/apifeatures.js";
import mongoose from "mongoose";

export const createStudent = async (req, res) => {
  try {
    const { name, email, password, phone, admissionNumber } = req.body;

    // 1. Validation
    if (!name || !email || !password || !phone || !admissionNumber) {
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

    const totalStudents = await Student.countDocuments({
      library: library._id,
    });

    const features = new ApiFeatures(
      Student.find({
        library: library._id,
      })
        .populate("user", "name email phone")
        .populate("library", "name address"),
      req.query,
    )
      .search(["admissionNumber", "status"])
      .filter()
      .sort()
      .paginate();

    const students = await features.query;

    return res.status(200).json({
      message: "Students retrieved successfully",

      pagination: {
        page,
        limit,
        totalStudents,
        totalPages: Math.ceil(totalStudents / limit),
      },

      students,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message,
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
      .populate("library", "name address");

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    return res.status(200).json({
      message: "Student retrieved successfully",
      student,
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
    const { name, email, phone, admissionNumber } = req.body;

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
