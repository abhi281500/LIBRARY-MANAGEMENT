import Student from "../models/student.model.js";
import User from "../models/user.model.js";
import Library from "../models/library.model.js";

export const createStudent = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            admissionNumber
        } = req.body;

        // 1. Validation
        if (!name || !email || !password || !phone || !admissionNumber) {
            return res.status(400).json({
                message: "Please fill all required fields"
            });
        }

        // 2. Check email already exists
        const existingUser = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        // 3. Find library of logged in owner
        const library = await Library.findOne({
            owner: req.user._id
        });

        if (!library) {
            return res.status(404).json({
                message: "Library not found for this owner"
            });
        }

        // 4. Create User
        const newUser = await User.create({
            name,
            email: email.trim().toLowerCase(),
            password,
            phone,
            role: "STUDENT"
        });

        // 5. Create Student
        const student = await Student.create({
            user: newUser._id,
            library: library._id,
            admissionNumber
        });

        // 6. Response
        return res.status(201).json({
            message: "Student created successfully",
            student
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }
};

export const getAllStudents = async (req, res) => {
    try {
        const library = await Library.findOne({
            owner: req.user._id
        });
        if (!library) {
            return res.status(404).json({
                message: "Library not found for this owner"
            });
        }
        const students = await Student.find({ library: library._id }).populate('user', 'name email phone').populate('library', 'name address');
        return res.status(200).json({
            message: "Students retrieved successfully",
            students
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }
};  

export const getStudentById = async (req, res) => {
    try{
    const { id } = req.params;
    const library = await Library.findOne({
        owner: req.user._id
    });
    if (!library) {
        return res.status(404).json({
            message: "Library not found for this owner"
        });
    }
    const student = await Student.findOne({ _id: id, library: library._id }).populate('user', 'name email phone').populate('library', 'name address');

    if (!student) {
        return res.status(404).json({
            message: "Student not found"
        });
    }


    return res.status(200).json({
        message: "Student retrieved successfully",
        student
    });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }

}

export const updateStudent = async (req, res) => {
    try {
    const { id } = req.params;
    const { name, email, phone, admissionNumber } = req.body;

    const library = await Library.findOne({
        owner: req.user._id
    });

    if (!library) {
        return res.status(404).json({
            message: "Library not found for this owner"
        });
    }

    const student = await Student.findOne({ _id: id, library: library._id });

    if (!student) {
        return res.status(404).json({
            message: "Student not found"
        });
    }
    
    const user = await User.findById(student.user);
    if (!user) {
    return res.status(404).json({
        message: "User not found"
    });
}

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;

    await user.save();

    student.admissionNumber =
        admissionNumber || student.admissionNumber;

    await student.save();



    return res.status(200).json({
        message: "Student updated successfully",
        student
    });
}
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }

}

export const deleteStudent = async (req, res) => {
    try {
    const { id } = req.params;

    const library = await Library.findOne({
        owner: req.user._id
    });

    if (!library) {
        return res.status(404).json({
            message: "Library not found for this owner"
        });
    }

    const student = await Student.findOne({ _id: id, library: library._id });

    if (!student) {
        return res.status(404).json({
            message: "Student not found"
        });
    }
    

    await User.findByIdAndDelete(student.user);
    await Student.findByIdAndDelete(id);

    return res.status(200).json({
        message: "Student deleted successfully"
    });
}
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }

}